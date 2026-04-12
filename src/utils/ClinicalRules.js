/**
 * Clinical Rule Engine
 * 
 * This module provides medically valid potential causes and advice based on body part and symptom inputs.
 * It is NOT a substitute for professional medical advice.
 * 
 * STRICT: NO RANDOM MOCK DATA. All mappings must be based on general medical knowledge.
 */

export const CLINICAL_RULES = {
    head: {
        causes: [
            { trigger: ['migraine', 'throbbing', 'light'], condition: 'Migraine', severity: 'medium', advice: 'Rest in a dark room. Stay hydrated.', specialist: 'Neurologist' },
            { trigger: ['sudden', 'severe', 'thunderclap'], condition: 'Thunderclap Headache', severity: 'critical', advice: 'Seek ER immediately. Could be a bleed.', specialist: 'Neurologist' },
            { trigger: ['dizzy', 'spinning'], condition: 'Vertigo', severity: 'medium', advice: 'Sit down. Avoid sudden movements.', specialist: 'ENT Specialist' }
        ],
        default: { condition: 'Tension Headache', severity: 'low', advice: 'Rest, hydrate, and reduce screen time.', specialist: 'General Physician' }
    },
    neck: {
        causes: [
            { trigger: ['stiff', 'fever', 'light'], condition: 'Meningitis Risk', severity: 'critical', advice: 'Go to ER immediately if fever + stiff neck.', specialist: 'General Physician' },
            { trigger: ['pain', 'turn'], condition: 'Cervical Strain', severity: 'low', advice: 'Apply heat, gentle stretching.', specialist: 'Orthopedist' }
        ],
        default: { condition: 'Neck Stiffness', severity: 'low', advice: 'Gentle stretches, improve posture.', specialist: 'Physiotherapist' }
    },
    shoulder: {
        causes: [
            { trigger: ['radiating', 'arm', 'chest'], condition: 'Referred Cardiac Pain', severity: 'critical', advice: 'Call Ambulance. Could be heart attack.', specialist: 'Cardiologist' },
            { trigger: ['frozen', 'stiff'], condition: 'Frozen Shoulder', severity: 'medium', advice: 'Physiotherapy needed.', specialist: 'Orthopedist' }
        ],
        default: { condition: 'Shoulder Strain', severity: 'low', advice: 'Rest and ice.', specialist: 'Orthopedist' }
    },
    chest: {
        causes: [
            { trigger: ['pressure', 'tight', 'squeeze', 'left'], condition: 'Angina / Heart Attack', severity: 'critical', advice: 'Call Ambulance immediately. Do not drive.', specialist: 'Cardiologist' },
            { trigger: ['sharp', 'breath', 'movement'], condition: 'Pleurisy / Muscular', severity: 'medium', advice: 'See a doctor if breathing hurts.', specialist: 'Pulmonologist' }
        ],
        default: { condition: 'Chest Wall Pain', severity: 'medium', advice: 'Monitor closely. Seek help if worse.', specialist: 'General Physician' }
    },
    stomach: {
        causes: [
            { trigger: ['right', 'lower', 'severe'], condition: 'Appendicitis', severity: 'critical', advice: 'Go to ER. Do not eat or drink.', specialist: 'General Surgeon' },
            { trigger: ['burning', 'acid'], condition: 'GERD / Acid Reflux', severity: 'low', advice: 'Antacids, avoid spicy food.', specialist: 'Gastroenterologist' }
        ],
        default: { condition: 'Gastritis / Indigestion', severity: 'low', advice: 'Light diet, hydration.', specialist: 'Gastroenterologist' }
    },
    pelvis: {
        causes: [
            { trigger: ['severe', 'bleeding'], condition: 'Pelvic Emergency', severity: 'critical', advice: 'Seek immediate medical attention.', specialist: 'Gynecologist' },
            { trigger: ['cramps'], condition: 'Menstrual Cramps / Strain', severity: 'low', advice: 'Heat pack, rest.', specialist: 'Gynecologist' }
        ],
        default: { condition: 'Pelvic Pain', severity: 'medium', advice: 'Consult a gynecologist or urologist.', specialist: 'Gynecologist' }
    },
    back: {
        causes: [
            { trigger: ['lower', 'lifting'], condition: 'Lumbar Strain', severity: 'medium', advice: 'Rest, avoid heavy lifting.', specialist: 'Orthopedist' },
            { trigger: ['numbness', 'legs'], condition: 'Disc Herniation W/ Nerve Compression', severity: 'high', advice: 'See specialist ASAP.', specialist: 'Spine Specialist' }
        ],
        default: { condition: 'Back Pain', severity: 'low', advice: 'Stretch, check posture.', specialist: 'Orthopedist' }
    },
    arm: {
        causes: [
            { trigger: ['left', 'numb', 'tingling'], condition: 'Cardiac Warning', severity: 'critical', advice: 'Check for other heart attack signs. Call ER.', specialist: 'Cardiologist' },
            { trigger: ['wrist', 'numb'], condition: 'Carpal Tunnel', severity: 'low', advice: 'Wrist splint, rest.', specialist: 'Orthopedist' }
        ],
        default: { condition: 'Muscle Strain', severity: 'low', advice: 'Rest arm.', specialist: 'General Physician' }
    },
    hand: {
        causes: [
            { trigger: ['tingling', 'numb'], condition: 'Peripheral Neuropathy', severity: 'medium', advice: 'Check blood sugar levels.', specialist: 'Diabetologist' },
            { trigger: ['joint', 'stiff'], condition: 'Arthritis', severity: 'medium', advice: 'Consult a rheumatologist.', specialist: 'Rheumatologist' }
        ],
        default: { condition: 'Hand Pain', severity: 'low', advice: 'Rest hands, ergonomic check.', specialist: 'Orthopedist' }
    },
    leg: {
        causes: [
            { trigger: ['swollen', 'red', 'hot', 'calf'], condition: 'DVT (Blood Clot)', severity: 'critical', advice: 'Go to ER immediately. Risk of embolism.', specialist: 'Vascular Surgeon' },
            { trigger: ['sciatica', 'shooting'], condition: 'Sciatica', severity: 'medium', advice: 'Physio, gentle stretching.', specialist: 'Orthopedist' }
        ],
        default: { condition: 'Muscle Fatigue', severity: 'low', advice: 'Elevate legs.', specialist: 'General Physician' }
    },
    knee: {
        causes: [
            { trigger: ['lock', 'pop', 'twist'], condition: 'Meniscus/Ligament Tear', severity: 'high', advice: 'Ortho consult required. MRI may be needed.', specialist: 'Orthopedist' },
            { trigger: ['stiff', 'morning'], condition: 'Osteoarthritis', severity: 'medium', advice: 'Weight management, physio.', specialist: 'Rheumatologist' }
        ],
        default: { condition: 'Knee Pain', severity: 'medium', advice: 'RICE (Rest, Ice, Compress, Elevate).', specialist: 'Orthopedist' }
    },
    foot: {
        causes: [
            { trigger: ['heel', 'morning'], condition: 'Plantar Fasciitis', severity: 'medium', advice: 'Stretching, proper footwear.', specialist: 'Podiatrist' },
            { trigger: ['numb'], condition: 'Neuropathy', severity: 'medium', advice: 'Check diabetes status.', specialist: 'Diabetologist' }
        ],
        default: { condition: 'Foot Pain', severity: 'low', advice: 'Comfortable shoes, soak feet.', specialist: 'Orthopedist' }
    },
    skin: {
        causes: [
            { trigger: ['rash', 'itch', 'red'], condition: 'Dermatitis / Eczema', severity: 'low', advice: 'Moisturize. Avoid triggers.', specialist: 'Dermatologist' },
            { trigger: ['hives', 'swell'], condition: 'Allergic Reaction', severity: 'high', advice: 'Take antihistamine. ER if breathing hard.', specialist: 'Allergist' }
        ],
        default: { condition: 'Skin Irritation', severity: 'low', advice: 'Keep clean and dry.', specialist: 'Dermatologist' }
    }
};

const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

export function analyzeSymptoms(bodyParts, description) {
    if (!bodyParts || bodyParts.length === 0) return null;

    // Ensure input is array
    const parts = Array.isArray(bodyParts) ? bodyParts : [bodyParts];
    const descLower = description.toLowerCase();

    let potentialCauses = [];

    // Collect all matching rules from all selected parts
    parts.forEach(part => {
        const partData = CLINICAL_RULES[part.toLowerCase()];
        if (partData) {
            const match = partData.causes.find(rule =>
                rule.trigger.some(keyword => descLower.includes(keyword))
            );
            if (match) {
                potentialCauses.push({ ...match, part });
            } else {
                potentialCauses.push({ ...partData.default, part });
            }
        }
    });

    if (potentialCauses.length === 0) return null;

    // Sort by severity (Highest first)
    potentialCauses.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

    // Return the most severe diagnosis, but mention other potential issues if multiple
    const primary = potentialCauses[0];

    // If we have multiple parts, we might want to synthesize the condition name
    if (parts.length > 1) {
        // Simple synthesis: "Chest & Arm Issues" or keep the primary specific condition
        // If the primary is "Unspecified", try to find a specific one even if lower severity? 
        // No, strict severity is safer.

        // Enhance advice if multiple parts involved
        if (potentialCauses.length > 1) {
            primary.advice += ` Note: Symptoms affecting multiple areas (${parts.join(', ')}) should be discussed with a doctor.`;
        }
    }

    return primary;
}
