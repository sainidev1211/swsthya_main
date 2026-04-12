import { API_BASE_URL } from '../api/config';
import drugInteractions from '../data/drugInteractions.json';
import Tesseract from 'tesseract.js';

async function exponentialBackoffFetch(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status !== 429) { return response; }
            console.warn(`Rate limit hit (429). Retrying in ${Math.pow(2, i)} seconds...`);
        } catch (error) {
            console.error('Fetch error:', error);
            if (i === maxRetries - 1) throw error;
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
    throw new Error('API request failed after multiple retries.');
}

// Helper for safe JSON extraction from AI response
function safeJSONParse(text) {
    if (!text) return null;
    try {
        // Strip markdown code blocks if present (e.g. ```json ... ```)
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
            const firstLineEnd = cleaned.indexOf('\n');
            const lastLineStart = cleaned.lastIndexOf('```');
            if (firstLineEnd !== -1 && lastLineStart !== -1 && lastLineStart > firstLineEnd) {
                cleaned = cleaned.substring(firstLineEnd + 1, lastLineStart).trim();
            }
        }

        // Find the first '{' and last '}' to extract the JSON object
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            const extracted = cleaned.substring(start, end + 1);
            return JSON.parse(extracted);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("[AI Frontend Parse Error]:", e.message, "\nRaw Text Snippet:", text.slice(0, 150));
        return null;
    }
}

async function callAI(messages, jsonMode = true, model = "llama-3.3-70b-versatile") {
    console.log(`[AI Proxy] Calling ${model} (JSON: ${jsonMode}) via Backend`);
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages,
            jsonMode,
            model
        })
    };

    try {
        const response = await fetch(`${API_BASE_URL}/ai/proxy`, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`AI Proxy Error: ${response.status} - ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        const content = result.data?.choices?.[0]?.message?.content;
        
        if (!content) {
            throw new Error("Empty response from AI Proxy");
        }

        console.log('AI Proxy Content:', content);
        try {
            return jsonMode ? safeJSONParse(content) : { text: content };
        } catch (parseErr) {
            console.error("Manual Parse Fallback:", parseErr);
            return { text: content, error: "Parsing failed" };
        }
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
}

export async function extractTextFromImage(imageFile) {
    console.log("[OCR] Starting Tesseract recognition...");
    const { data: { text } } = await Tesseract.recognize(
        imageFile,
        "eng",
        {
            logger: m => console.log(`[OCR Progress] ${m.status}: ${Math.round(m.progress * 100)}%`)
        }
    );
    return text;
}

export function cleanMedicalText(text) {
    return text
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export async function evaluateMedicalSafety(productName, userRecords, additionalAnswers = {}, user = null) {
    if (!userRecords || userRecords.length === 0) {
        return {
            status: "SAFE",
            reasoning: "No medical history available for personalized analysis.",
            risk_source: [],
            future_risk_prediction: { insight: "No history", suggested_action: "Upload records" },
            alternative: null,
            doctorAdvised: false,
            needsMoreInfo: false,
            followUpQuestion: null
        };
    }

    const ageInfo = user ? `Patient Age: ${user?.age || user?.personalInfo?.age || 'Unknown'}` : 'Patient Age: Unknown';

    const normalize = (s) => (s || "").split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const searchMed = normalize(productName);

    let knownInteractions = [];
    userRecords.forEach(r => {
        let meds = r.medication || [];
        if (typeof meds === 'string') meds = meds.split(',').map(m => m.trim());
        if (Array.isArray(meds)) {
            meds.forEach(m => {
                const existingMed = normalize(m);
                // Check both ways in drugInteractions.json
                Object.keys(drugInteractions).forEach(key => {
                    const normalizedKey = normalize(key);
                    if (normalizedKey === existingMed) {
                        const match = drugInteractions[key].find(i => normalize(i.interacts_with) === searchMed);
                        if (match) knownInteractions.push(`User takes ${m} -> Conflict with ${productName}: ${match.risk}`);
                    }
                    if (normalizedKey === searchMed) {
                        const match = drugInteractions[key].find(i => normalize(i.interacts_with) === existingMed);
                        if (match) knownInteractions.push(`Conflict between ${productName} and ${m}: ${match.risk}`);
                    }
                });
            });
        }
    });

    const interactionsText = knownInteractions.length > 0
        ? `\nCRITICAL SYSTEM WARNING:\nExplicit drug interactions detected from medical database:\n${knownInteractions.join('\n')}\nYou MUST factor this into your reasoning and return DANGEROUS or CAUTION.`
        : '';

    const prompt = `
SYSTEM ROLE:
You are a Medical Safety Analysis Engine inside the Swasthy Healthcare System.

STRICT RULES:
1. Only analyze the user's real medical records provided in the input.
2. Never create assumptions, demo data, or imaginary patient information.
3. If no medical history exists, return SAFE with a message saying that no personalized analysis can be performed.
4. Do not invent age, diseases, or prescriptions.
5. All warnings must reference evidence from the provided records.
6. ${ageInfo.includes('Unknown') || parseInt(ageInfo.split(':')[1].trim()) < 12 ? 'PEDIATRIC SAFETY: Patient is under 12. Treat Aspirin, Codeine, and Adult Decongestants as highly unsafe.' : 'Standard age parameters apply.'}

TASK:
A user searched for a medication or condition: "${productName}". Analyze whether the medication is SAFE, CAUTION, or DANGEROUS based only on the medical records provided.

INPUT DATA:
User Medical History:
    ${JSON.stringify(userRecords.map(r => ({
        type: r.type || r.file_type,
        disease: r.disease || r.title || r.condition || r.diagnosis || r.file_name,
        status: r.status,
        medications: r.medication || r.medicationsTaken,
        allergies: (r.type === 'Allergy' || r.file_type === 'Allergy') ? (r.title || r.disease || r.condition) : null
    })), null, 2)}
${interactionsText}

OUTPUT FORMAT (STRICT JSON):
{
    "status": "SAFE" | "CAUTION" | "DANGEROUS",
    "risk_source": ["Source 1", "Source 2"],
    "reasoning": "Explain why the medication may or may not be safe based ONLY on the provided records.",
    "future_risk_prediction": {
        "insight": "Predictive insight combining past history with this medicine.",
        "suggested_action": "Recommendation for the user."
    },
    "alternative": "Suggest a safer alternative if DANGEROUS/CAUTION, else null",
    "doctorAdvised": true | false,
    "needsMoreInfo": true | false,
    "followUpQuestion": "A single question asking for clarification if needed, else null"
}

IMPORTANT:
If User Medical History is empty, output:
"status": "SAFE"
"reasoning": "No medical history available for personalized analysis."
"future_risk_prediction.suggested_action": "Upload medical records for better safety insights."
    `;

    return callAI([
        { role: "system", content: "You are an expert AI clinical safety engine. Output valid JSON only." },
        { role: "user", content: prompt }
    ]);
}

export async function fetchAIResponse(userQuery, systemInstruction) {
    const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: userQuery }
    ];
    return callAI(messages, false); // Returns { text: ... }
}

export async function analyzeReportWithAI(text) {
    const prompt = `
SYSTEM ROLE:
You are a Medical Document Analysis Engine inside the Swasthy Healthcare System.

TASK:
Analyze the provided medical text/report and extract all possible medical information into structured JSON.

STRICT RULES:
1. Do not ask the user for missing fields if information exists in the document.
2. Extract medical insights even if some fields are missing.
3. Never hallucinate diseases that are not written.
4. If a field is not present, mark it as "Not specified".
5. Always generate a short medical interpretation in the "summary" field.

INPUT:
Report Text: "${text}"

OUTPUT FORMAT (STRICT JSON):
{
    "summary": "Short medical interpretation of the document.",
    "key_points": ["Key Finding 1", "Key Finding 2"],
    "health_alerts": ["Alert 1", "Alert 2"],
    "recommendations": ["Recommendation 1", "Recommendation 2"],
    "type": "Lab Report" | "Prescription",
    "patientInfo": {
        "name": "String or 'Not specified'",
        "age": "String or 'Not specified'"
    },
    "vitals": {
        "bp": "String or 'Not specified'",
        "pulse": "String or 'Not specified'"
    },
    "symptoms": ["Symptom 1", "Symptom 2"] or [],
    "diagnosis": "String or 'Not specified'",
    "specialist": "Recommended Specialist or 'General Physician'",
    "doctor": "Doctor Name or 'Not specified'",
    "medicines": [
        { "name": "Med Name", "dosage": "Dosage", "freq": "Frequency" }
    ]
}
    `;

    return callAI([
        { role: "system", content: "You are a specialized medical document analyst. Output valid JSON only." },
        { role: "user", content: prompt }
    ]);
}

export async function searchMedicineWithAI(query, userRecords = [], user = null) {
    const ageInfo = user && user.age ? `Patient Age: ${user.age}` : 'Patient Age: Unknown';

    const normalize = (s) => (s || "").split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const searchMed = normalize(query);

    let knownInteractions = [];
    userRecords.forEach(r => {
        let meds = r.medication || [];
        if (typeof meds === 'string') meds = meds.split(',').map(m => m.trim());
        if (Array.isArray(meds)) {
            meds.forEach(m => {
                const existingMed = normalize(m);
                Object.keys(drugInteractions).forEach(key => {
                    const normalizedKey = normalize(key);
                    if (normalizedKey === existingMed) {
                        const match = drugInteractions[key].find(i => normalize(i.interacts_with) === searchMed);
                        if (match) knownInteractions.push(`User takes ${m} -> Conflict with ${query}: ${match.risk}`);
                    }
                    if (normalizedKey === searchMed) {
                        const match = drugInteractions[key].find(i => normalize(i.interacts_with) === existingMed);
                        if (match) knownInteractions.push(`Conflict between ${query} and ${m}: ${match.risk}`);
                    }
                });
            });
        }
    });

    const interactionsText = knownInteractions.length > 0
        ? `\nCRITICAL SYSTEM WARNING:\nExplicit drug interactions detected from medical database:\n${knownInteractions.join('\n')}\nYou MUST factor this into your reasoning and return DANGEROUS or CAUTION.`
        : '';

    const historyText = userRecords && userRecords.length > 0
        ? `User Medical History:\n${JSON.stringify(userRecords.map(r => ({
            type: r.type || r.file_type,
            disease: r.disease || r.title || r.condition || r.diagnosis || r.file_name,
            status: r.status,
            medications: r.medication || r.medicationsTaken,
            allergies: (r.type === 'Allergy' || r.file_type === 'Allergy') ? (r.title || r.disease || r.condition) : null
        })), null, 2)}`
        : "PATIENT HISTORY IS EMPTY.";

    const prompt = `
SYSTEM ROLE:
You are a Medical Safety Analysis Engine inside the Swasthy Healthcare System.

STRICT RULES:
1. Only analyze the user's real medical records provided in the input.
2. Never create assumptions, demo data, or imaginary patient information.
3. If no medical history exists, return SAFE with a message saying that no personalized analysis can be performed.
4. Do not invent age, diseases, or prescriptions.
5. All warnings must reference evidence from the provided records.
6. ${ageInfo.includes('Unknown') || parseInt(ageInfo.split(':')[1].trim()) < 12 ? 'PEDIATRIC SAFETY: Patient is under 12. Treat Aspirin, Codeine, and Adult Decongestants as highly unsafe.' : 'Standard age parameters apply.'}

TASK:
A user searched for: "${query}". Analyze whether it is SAFE, CAUTION, or DANGEROUS based only on the medical records provided, and provide general medication details.

INPUT DATA:
${historyText}
${interactionsText}

OUTPUT FORMAT (STRICT JSON):
{
    "type": "medicine" | "disease" | "symptom" | "general",
    "en": {
        "title": "Name in English",
        "what": { "label": "What is this?", "content": "Simple definition and medical context." },
        "why": { "label": "Why does it happen?", "content": "Causes, risk factors, and how it develops." },
        "how": { "label": "How to resolve?", "content": "Treatment options, home care tips, and when to see a doctor." },
        "alternatives": [
            { "name": "Alt Med 1", "type": "Generic/Brand", "dosage": "Form" } 
        ]
    },
    "hi": {
        "title": "Name in Hindi",
        "what": { "label": "यह क्या है?", "content": "Explain in simple Hindi." },
        "why": { "label": "क्यों होता है?", "content": "Explain causes in simple Hindi." },
        "how": { "label": "इलाज / समाधान", "content": "Explain treatments in simple Hindi." },
        "alternatives": [],
        "meds": []
    },
    "safety_status": {
        "status": "SAFE" | "CAUTION" | "DANGEROUS",
        "risk_source": ["Source 1", "Source 2"],
        "reasoning": "Clear explanation of why this classification was made.",
        "future_risk_prediction": {
            "insight": "Predictive insight.",
            "suggested_action": "Actionable advice."
        },
        "alternative": "Suggest an alternative if DANGEROUS/CAUTION, else null",
        "doctorAdvised": true | false,
        "needsMoreInfo": true | false,
        "followUpQuestion": "A question asking for clarification if needed, else null"
    },
    "critical_alert": "If life-threatening based strictly on user history, put warning here, else null.",
    "meds": [
        { "name": "Common Med Name", "type": "Tablet/Syrup", "dosage": "General Dosage" }
    ],
    "warnings": ["Warning 1", "Warning 2"]
}

IMPORTANT:
If PATIENT HISTORY IS EMPTY, safety_status.status MUST be "SAFE", risk_source MUST be [], critical_alert MUST be null, and reasoning MUST state: "No medical history available for personalized analysis."
    `;

    return callAI([
        { role: "system", content: "You are an expert medical AI and clinical safety engine. Output valid JSON only." },
        { role: "user", content: prompt }
    ]);
}

export async function chatWithAI(history, message, records = [], analysis = null) {
    const historyText = records && records.length > 0 
        ? `\n\nUSER MEDICAL HISTORY (From Database):\n${JSON.stringify(records.map(r => ({ type: r.file_type || r.type, original_data: r.processed_data, date: r.uploaded_at || r.created_at || r.diagnosedAt })), null, 2)}` 
        : "\n\nUSER MEDICAL HISTORY: No medical history found.";
        
    const insightsText = analysis && analysis.summary 
        ? `\n\nAI HEALTH INSIGHTS:\n${analysis.summary}\nKey Risks: ${JSON.stringify(analysis.risks)}`
        : "";

    const systemPrompt = `You are a Smart AI Chatbot powered by the user's uploaded medical records and insights. Keep answers concise, empathetic, and intelligent.
    
    CRITICAL: 
    - You must fetch and read the USER MEDICAL HISTORY and AI HEALTH INSIGHTS provided below to gather context memory.
    - If the user asks "Show my previous reports" or questions about past data, fetch the data from the memory below, summarize it, and answer directly based on this personalized historical data.
    - Give personalized suggestions based on abnormalities or past uploads.
    - Do NOT provide definitive diagnoses, but suggest possibilities based on the data and advise consulting a doctor.

    ${historyText}
    ${insightsText}`;

    const messages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message }
    ];

    const result = await callAI(messages, false); // false = regular text response
    return result.text;
}

export async function testAIConnection() {
    return callAI([
        { role: "user", content: "Output { \"status\": \"ok\" } if you can hear me." }
    ]);
}

export async function analyzeSymptomsWithAI(selectedParts, description, base64Image = null, medicalHistory = []) {
    const historyText = medicalHistory.length > 0
        ? `User Medical History: \n${medicalHistory.map(r => `- ${r.type || r.file_type}: ${r.title || r.disease || r.condition || r.diagnosis || r.file_name} (Status: ${r.status || 'Unknown'}, Meds: ${r.medication || r.medicationsTaken || 'None'})`).join('\n')} `
        : "No previous medical history provided.";

    let prompt = `
    ${historyText}

    Analyze the following symptoms in context of the user's history:
    Affected Body Parts: ${Array.isArray(selectedParts) ? selectedParts.join(', ') : selectedParts}
    Description: "${description}"
    
    Output JSON(STRICTLY):
    {
        "severity": "low/medium/high/critical",
            "condition": "Condition Name",
                "summary_en": "Simple summary in English (2-3 sentences)",
                    "summary_hi": "Simple summary in Hindi (2-3 sentences)",
                        "advice": "Immediate advice",
                            "medicines": ["Medicine 1", "Medicine 2"],
                                "specialist": "Specialist Name"
    }
    `;

    const messages = [
        { role: "system", content: "You are a medical diagnostic AI. Output valid JSON only." }
    ];

    if (base64Image) {
        messages.push({
            role: "user",
            content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: base64Image } }
            ]
        });
        // Use a vision model if available, or fallback to text if prompt is just text
        // Note: For this specific tool, we'll try to use a vision model if the user sends an image
        // Ideally we would switch the model param in callAI.
        // For now, assuming callAI handles model selection or we must modify callAI.
        // Since callAI has hardcoded model, we need to inspect callAI.
    } else {
        messages.push({ role: "user", content: prompt });
    }

    return callAI(messages, true, base64Image ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile");
}

export async function analyzeMedicineImageWithAI(base64Image, userRecords = [], user = null) {
    const ageInfo = user && user.age ? `Patient Age: ${user.age}` : 'Patient Age: Unknown';

    const historyText = userRecords && userRecords.length > 0
        ? `User Medical History:\n${JSON.stringify(userRecords.map(r => ({ type: r.type, disease: r.disease || r.title, status: r.status, medications: r.medication, allergies: r.type === 'Allergy' ? r.title : null })), null, 2)}`
        : "PATIENT HISTORY IS EMPTY.";

    const prompt = `
SYSTEM ROLE:
You are a Medical Safety Analysis Engine inside the Swasthy Healthcare System.

STRICT RULES:
1. Only analyze the user's real medical records provided in the input.
2. Never create assumptions, demo data, or imaginary patient information.
3. If no medical history exists, return SAFE with a message saying that no personalized analysis can be performed.
4. Do not invent age, diseases, or prescriptions.
5. All warnings must reference evidence from the provided records.
6. ${ageInfo.includes('Unknown') || parseInt(ageInfo.split(':')[1].trim()) < 12 ? 'PEDIATRIC SAFETY: Patient is under 12. Treat Aspirin, Codeine, and Adult Decongestants as highly unsafe.' : 'Standard age parameters apply.'}

TASK:
Identify the medicine in the provided image (pill, strip, bottle, or prescription). Analyze whether it is SAFE, CAUTION, or DANGEROUS based only on the medical records provided.

REFERENCE DATA (Known Drug Interactions):
${JSON.stringify(drugInteractions, null, 2)}

INPUT DATA:
${historyText}

OUTPUT FORMAT (STRICT JSON):
{
    "type": "medicine",
    "en": {
        "title": "Medicine Name",
        "what": { "label": "What is this?", "content": "Description and uses." },
        "why": { "label": "Used for", "content": "Conditions it treats." },
        "how": { "label": "How to use", "content": "General dosage/usage instructions." },
        "alternatives": [
            { "name": "Alt 1", "type": "Generic", "dosage": "Mg" }
        ]
    },
    "hi": {
        "title": "दवा का नाम",
        "what": { "label": "यह क्या है?", "content": "Hindi description." },
        "why": { "label": "उपयोग", "content": "Hindi uses." },
        "how": { "label": "कैसे इस्तेमाल करें", "content": "Hindi usage." },
        "alternatives": [],
        "meds": []
    },
    "safety_status": {
        "status": "SAFE" | "CAUTION" | "DANGEROUS",
        "risk_source": ["Source 1", "Source 2"],
        "reasoning": "Clear explanation of why this classification was made. Reference the interaction database if a match is found.",
        "future_risk_prediction": {
            "insight": "Predictive insight.",
            "suggested_action": "Actionable advice."
        },
        "alternative": "Suggest an alternative if DANGEROUS/CAUTION, else null",
        "doctorAdvised": true | false,
        "needsMoreInfo": true | false,
        "followUpQuestion": "A question asking for clarification if needed, else null"
    },
    "critical_alert": "If life-threatening based strictly on user history, put warning here, else null.",
    "warnings": ["Side effect 1", "Precaution 1"]
}
    `;

    const messages = [
        { role: "system", content: "You are a pharmacist and safety AI engine. Output valid JSON only." },
        {
            role: "user",
            content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: base64Image } }
            ]
        }
    ];

    return callAI(messages, true, "llama-3.2-11b-vision-preview");
}

export async function generateDailyRoutine(age, lifestyle, gender = 'Not specified') {
    const prompt = `
    Create a personalized daily health & productivity routine for a person with the following profile:
    - Age: ${age}
    - Lifestyle / Occupation: ${lifestyle}
    - Gender: ${gender}

    The routine should be realistic, healthy, and optimized for their specific lifestyle.
    Include specific advice for diet, exercise, and mental well - being suited to their age and role.

    Output STRICT JSON format:
    {
        "schedule": [
            { "time": "07:00 AM", "task": "Activity details", "category": "health/work/meal/rest", "icon": "droplets/activity/coffee/sun/moon/heart" }
        ],
            "tips": [
                { "title": "Tip Title", "description": "Specific advice" }
            ],
                "nutritional_focus": "Brief dietary advice for today"
    }
    `;

    return callAI([
        { role: "system", content: "You are a wellness coach AI. Output valid JSON only. Choose icons from: droplets, activity, coffee, sun, moon, heart, brain." },
        { role: "user", content: prompt }
    ]);
}

export async function generateHealthSummary(records, user = null) {
    const recordsText = records.map(r =>
        `Type: ${r.type}, Title: ${r.title}, Status: ${r.status}, Date: ${r.diagnosedAt}, Notes: ${r.notes}`
    ).join('\n');

    const ageInfo = user ? `Patient Age: ${user?.age || user?.personalInfo?.age || 'Unknown'}` : 'Patient Age: Unknown';

    const prompt = `
SYSTEM ROLE
You are an evidence-based Health Summary AI integrated into a medical dashboard used by patients and doctors. Your job is to analyze prescriptions (Rx), stored medical history, and user-entered conditions to generate an accurate, structured health profile. Your output must support long-term tracking of diseases, treatments, and consultation needs.

Patient Records:
${recordsText}

${ageInfo}

PART 1 — Executive Summary Rules
Generate summaries ONLY from actual structured data.
If condition name is unclear (e.g., "Random") or insufficient data exists:
Return exactly: "Insufficient medical details to generate a reliable summary."
Do NOT invent explanations or generic statements.
Summary must include ONLY:
- Identified condition
- Status (Active/Recovered)
- Key symptoms
- Treatment context
No filler text.

⚖️ PRIORITY RULES (STRICT)
- If a prescription (Rx) is uploaded → Base 80% analysis ONLY on Rx.
- Patient history & manually added diseases → 20%.
- WARNING: IF HISTORY IS EMPTY OR HAS NO REAL DISEASES, you MUST output empty arrays for risks, extractedMedicines, preventiveAdvice and generic guidance.
- Never invent diseases, recovery, or dates. Do NOT hallucinate conditions.
- If data is missing → ASK USER TO PROVIDE IT in missingDataAlert.
- Never assume "current condition" without evidence.
- If Rx unclear → say "Prescription data unclear".
- If prescription data conflicts with user-entered history, prioritize the prescription.

🚫 ANTI-COPY RULE
- Do NOT generate summaries by simply replacing disease names.
- Each summary must be uniquely derived from Rx details, Vitals, Medicines, Doctor notes, and Stored history.

📥 DATA COLLECTION RULE
If required medical details are missing, ask user for: Disease name, Start date (ask user, do NOT auto-fill), Recovery status, Current medications, Doctor name (optional). Never generate fake dates like "2026-03-01".

📊 DASHBOARD OUTPUT FORMAT (STRICT JSON)
{
    "healthScore": "A number from 1-100 calculating overall health based on risks and conditions",
    "healthStatus": "Safe | Moderate | Risk",
    "summary": "Must follow Executive Summary Rules exactly.",
    "timeline": [
        { "disease": "Disease name", "status": "Active or Recovered", "dateAdded": "YYYY-MM-DD or Unknown", "medicinesTaken": "Specific medicines taken for this condition, or 'None'" }
    ],
    "risks": [
        { "condition": "Observation/Risk/Vitals", "level": "low" | "medium" | "high" | "critical", "description": "Important notes on vitals, findings, or severity." }
    ],
    "extractedMedicines": [
        { "name": "Medicine Name", "purpose": "Dosage & Instructions" }
    ],
    "preventiveAdvice": [
        "Personalized recommendations based on conditions."
    ],
    "treatmentGuidance": {
        "medicineActions": "continue / review / none",
        "consultationNeeded": "Yes / No / Monitor",
        "suggestedSpecialist": "Type of specialist or 'None'"
    },
    "doctorRecommendation": {
        "status": "Routine checkup recommended" | "Immediate consultation advised" | "No urgent action needed" | "Monitor",
        "visitNeeded": "Yes" | "No" | "Monitor",
        "severity": "Low" | "Moderate" | "High",
        "nextCheckup": "Ask user to schedule OR recommended timeframe",
        "urgency": 1-10,
        "reason": "Clear medical rationale for the recommendation."
    },
    "missingDataAlert": null // OR "More medical details required from user. Please provide: [Missing items]"
}
    `;

    return callAI([
        { role: "system", content: "You are a senior medical consultant AI. Output valid JSON only." },
        { role: "user", content: prompt }
    ], true, "llama-3.3-70b-versatile");
}

export async function checkMedicineInteraction(medicineName, historyRecords) {
    const recordsText = historyRecords.map(r =>
        `Condition: ${r.title}, Status: ${r.status}, Notes: ${r.notes} `
    ).join('\n');

    const prompt = `
    Check if the medicine "${medicineName}" has any negative interactions or risks given the user's medical history:
    ${recordsText}

    Output JSON(Strictly follow this):
    {
        "hasInteraction": true / false,
            "severity": "low/medium/high/critical",
                "alert": "Clear warning message if interaction exists, else null",
                    "details": "Explanation of why this medicine might be risky or safe.",
                        "saferAlternatives": ["Alternative 1", "Alternative 2"]
    }
    `;

    return callAI([
        { role: "system", content: "You are a clinical pharmacologist AI. Cross-check medicines against patient history. Output valid JSON only." },
        { role: "user", content: prompt }
    ], true, "llama-3.3-70b-versatile");
}


export async function extractDataFromPrescription(base64Image) {
    console.log("[OCR] Initiating extraction from image...");
    const rawText = await extractTextFromImage(base64Image);
    const cleanedText = cleanMedicalText(rawText);
    console.log("OCR Extracted Text:", cleanedText);

    if (!cleanedText || cleanedText.length < 30) {
        console.error("[OCR] Text too short or empty. Extraction failed.");
        throw new Error("INCOMPLETE_INFO");
    }

    const prompt = `
SYSTEM ROLE:
You are a Medical Document Analysis Engine inside the Swasthy Healthcare System.

TASK:
Analyze the following medical prescription text and extract all possible medical information into structured JSON.

STRICT RULES:
1. Do not ask the user for missing fields if information exists in the document.
2. Extract medical insights even if some fields are missing.
3. Never hallucinate diseases that are not written.
4. If a field is not present, mark it as "Not specified".
5. Always generate a short medical interpretation in the "summary" field.

Prescription text:
"${cleanedText}"

OUTPUT FORMAT (STRICT JSON):
{
    "type": "Prescription",
    "patientInfo": {
        "name": "String or 'Not specified'",
        "age": "String or 'Not specified'"
    },
    "vitals": {
        "bp": "String or 'Not specified'",
        "pulse": "String or 'Not specified'"
    },
    "symptoms": ["Symptom 1", "Symptom 2"] or [],
    "diagnosis": "String or 'Not specified'",
    "summary": "Short medical interpretation of the prescription.",
    "title": "Primary Diagnosis or Main Medicine",
    "disease": "The specific condition identified",
    "status": "Active",
    "diagnosedAt": "YYYY-MM-DD (If found, else use today's date)",
    "medication": ["MedicineName Dose", "e.g., Pantoprazole 40mg"],
    "medicines": [
        { "name": "Med Name", "dosage": "Dosage", "freq": "Frequency" }
    ],
    "notes": "Brief extraction of doctor notes or instructions or 'Not specified'"
}
    `;

    return callAI([
        { role: "system", content: "You are a specialized medical OCR and extraction AI. Output valid JSON only." },
        { role: "user", content: prompt }
    ], true, "llama-3.3-70b-versatile");
}

export async function generateFollowUpQuestions(recordData) {
    const prompt = `
    Based on the following user text and medical information, generate 1 - 3 highly relevant, conversational follow - up questions to ask the user to complete their medical record.
    The goal is to determine the severity, duration, and current status of their condition if it's missing.

    User Input / Extracted Data: ${JSON.stringify(recordData)}

    Rules:
    - Ask only what is currently missing from the data.
    - If it's a condition (like headache), ask how long it's been happening or the severity.
    - If it's an allergy, ask about the reaction type.
        - Ask in a polite, direct, first - person conversational tone(e.g., "How long have you been experiencing this?").
    - Do not list options, just ask the question.
    - Return a JSON array of strings(questions).Maximum 3. If no questions needed, return empty array.

    Output format:
    { "questions": ["Question 1", "Question 2"] }
    `;

    return callAI([
        { role: "system", content: "You are a clinical intake assistant. Output valid JSON only." },
        { role: "user", content: prompt }
    ]);
}

export async function analyzeDoctorVisitNecessity(records, additionalQuery = null) {
    if (!records || records.length === 0) {
        return {
            recommendation: "Routine Checkup",
            urgency: "low",
            reason: "You have no active medical conditions recorded. A routine annual checkup is always good practice.",
            specialist: "General Physician",
            timeframe: "Within 6 months"
        };
    }

    const prompt = `
    You are a triage AI evaluating a patient's need for a doctor visit.
    
    Patient Records:
    ${JSON.stringify(records.map(r => ({ disease: r.disease || r.title, status: r.status, duration: r.duration, severity: r.severity })), null, 2)}
    
    ${additionalQuery ? 'Recent Symptom/Query: ' + additionalQuery : ''}

    Task:
    Analyze the records(and query if present).Determine if the user needs to see a doctor immediately, soon, or just routine.
    - Focus heavily on "Active" conditions with "high" or "critical" severity.
    - If multiple active chronic issues exist, suggest a specialist visit soon.

    Output JSON EXACTLY in this format:
    {
        "recommendation": "Immediate Visit" | "Visit Soon" | "Routine Checkup",
            "urgency": "high" | "medium" | "low",
                "reason": "Clear, empathetic explanation of why this visit is recommended based on their specific records.",
                    "specialist": "Name of the recommended specialist (e.g., Cardiologist, General Physician)",
                        "timeframe": "Suggested timeframe (e.g., 'Today', 'Within 2 weeks', 'Next 3-6 months')"
    }
    `;

    return callAI([
        { role: "system", content: "You are a medical triage assistant. Output only valid JSON." },
        { role: "user", content: prompt }
    ], true, "llama-3.3-70b-versatile");
}
