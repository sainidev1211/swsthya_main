import { useState } from 'react';
import BodyMap from '../components/features/BodyMap';
import { fetchAIResponse } from '../services/aiService';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { saveUserActivity } from '../api';
import { History, Download } from 'lucide-react';

export default function Allergy() {
    const { user } = useAuth();
    const [view, setView] = useState('front');
    const [selectedParts, setSelectedParts] = useState([]);
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [symptoms, setSymptoms] = useState('');
    const [photo, setPhoto] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    const toggleBodyPart = (partId, label) => {
        if (selectedParts.includes(partId)) {
            setSelectedParts(selectedParts.filter(id => id !== partId));
            setSelectedLabels(selectedLabels.filter(l => l !== label));
        } else {
            // Allow multiple selection logic
            setSelectedParts([...selectedParts, partId]);
            // Avoid duplicate labels if clicking same part type on different view (unlikely with unique IDs but good safety)
            if (!selectedLabels.includes(label)) {
                setSelectedLabels([...selectedLabels, label]);
            }
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result); // Base64 string
                toast.success("Photo uploaded successfully");
            };
            reader.readAsDataURL(file);
        }
    };

    const runAllergyDiagnosis = async () => {
        if (selectedParts.length === 0 && !symptoms.trim() && !photo) {
            toast.error("Please provide at least one input (Body Part, Symptoms, or Photo).");
            return;
        }

        setIsLoading(true);
        setResults(null);

        const bodyPartsString = selectedLabels.join(', ');
        const userQuery = `
      Analyze the user's condition.
      1. Body Location: ${bodyPartsString || 'None Selected'}
      2. Text Symptoms: ${symptoms || 'None'}
      3. Image Status: ${photo ? 'Image provided' : 'No image provided'}
      
      Provide a diagnosis in the strict format below.
    `;

        const systemInstruction = `
      You are a sophisticated AI Dermatologist & Allergy Expert.
      Combine the user's text symptoms, body location, and image to provide a detailed, accurate diagnosis.
      
      Your entire response MUST be **bilingual**: English / Hinglish, separated by a forward slash (/). Do not use markdown bolding (* or **).
      
      Output MUST follow this precise format with newline separation:
      
      Severity Score: [0-10 Score based on all inputs] / [Score translation]
      Diagnosis: [Type of Allergy/Infection/Skin Issue] / [Hinglish Diagnosis]
      Possible Causes: [AI Allergen Finder result] / [Hinglish Causes]
      Immediate Solution: [Immediate Action] / [Hinglish Action]
      OTC Medicines: [Recommended OTC Medicines] / [Hinglish OTCs]
      Warning: [When to visit doctor] / [Hinglish Warning]
      Diet Precaution: [Dietary suggestion] / [Hinglish Diet]
      Auto Interaction Check: [Safe/Unsafe] / [Hinglish Check]
    `.trim();

        try {
            const { text } = await fetchAIResponse(userQuery, systemInstruction, photo);

            // Parse results
            const parts = text.trim().split('\n');
            const parsedResults = {};
            parts.forEach(part => {
                const [key, ...valueParts] = part.split(':');
                if (key && valueParts.length > 0) {
                    parsedResults[key.trim().toLowerCase().replace(/ /g, '')] = valueParts.join(':').trim();
                }
            });

            setResults(parsedResults);
            toast.success("Diagnosis Complete");

        } catch (error) {
            console.error("Diagnosis failed:", error);
            toast.error("Diagnosis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderResultItem = (label, key) => {
        if (!results || !results[key]) return null;
        const [english, hindi] = results[key].split('/');
        return (
            <div className="border-t border-red-200 dark:border-red-700 pt-2">
                <span className="font-bold text-gray-700 dark:text-gray-300">{label}:</span>
                <div className="ml-0 md:ml-2 text-sm text-gray-800 dark:text-gray-200">
                    <span>{english}</span>
                    {hindi && <span className="block text-gray-500 dark:text-gray-400 text-xs italic">{hindi}</span>}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Allergy & Body Pain Checker</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">

                {/* Step 1: Body Map */}
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 border-b border-red-500 pb-1">Step 1: Select Body Area</h3>
                <div className="flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-40 sm:w-48">
                        <BodyMap view={view} selectedParts={selectedParts} onPartClick={toggleBodyPart} />
                    </div>

                    <div className="flex flex-col space-y-2 w-full sm:w-auto">
                        <button
                            onClick={() => setView('front')}
                            className={`px-3 py-2 ${view === 'front' ? 'bg-indigo-600' : 'bg-indigo-400'} text-white font-semibold rounded-lg text-sm transition`}
                        >
                            Front View
                        </button>
                        <button
                            onClick={() => setView('back')}
                            className={`px-3 py-2 ${view === 'back' ? 'bg-gray-600' : 'bg-gray-400'} text-white font-semibold rounded-lg text-sm transition`}
                        >
                            Back View
                        </button>
                        <p className="text-sm font-medium text-center text-red-500 dark:text-red-400 mt-2">
                            Selected: {selectedLabels.length > 0 ? selectedLabels.join(', ') : 'None'}
                        </p>
                    </div>
                </div>

                {/* Step 2: Details */}
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 border-b border-red-500 pb-1 pt-4">Step 2: Describe or Scan</h3>

                <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms (e.g., 'Skin itching on arm, little red dots...')."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base h-24"
                ></textarea>

                <label className="flex justify-center items-center px-4 py-3 bg-red-500 text-white font-semibold rounded-lg text-sm hover:bg-red-600 cursor-pointer submit-button transition">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.218A2 2 0 0110.457 4h3.085a2 2 0 011.664.89l.812 1.218A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                    {photo ? 'Change Photo' : 'Upload Photo of Skin Issue'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {photo && <div className="text-xs text-center text-green-600">Photo selected</div>}

                <button
                    onClick={runAllergyDiagnosis}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 submit-button flex justify-center items-center disabled:bg-gray-400"
                >
                    <span>{isLoading ? 'Running Multi-Modal Diagnosis...' : 'Run Diagnosis'}</span>
                    {isLoading && <div className="spinner ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                </button>

                {/* Results */}
                {results && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg space-y-3 animate-fade-in">
                        <div className="text-xl font-extrabold text-red-700 dark:text-red-300">
                            Severity: {results.severityscore?.split('/')[0]} <span className="text-sm font-normal text-gray-500">/ {results.severityscore?.split('/')[1]}</span>
                        </div>

                        {renderResultItem('Diagnosis', 'diagnosis')}
                        {renderResultItem('Possible Causes', 'possiblecauses')}
                        {renderResultItem('Immediate Solution', 'immediatesolution')}
                        {renderResultItem('OTC Medicines', 'otcmedicines')}
                        {renderResultItem('Diet Precaution', 'dietprecaution')}
                        {renderResultItem('Warning', 'warning')}
                        {renderResultItem('Interaction Check', 'autointeractioncheck')}

                        <div className="flex justify-end mt-6 gap-4 print:hidden">
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    if (!user) {
                                        toast.error("Please log in or use guest account to save to history");
                                        return;
                                    }
                                    try {
                                        const userId = user.id || user.uid || user.email;
                                        await saveUserActivity(userId, 'allergy_report', {
                                            condition: results, // Use 'results' here, as 'result' was not defined
                                            date: new Date().toISOString()
                                        });
                                        toast.success("Report Saved to History securely!");
                                    } catch (e) {
                                        console.error(e);
                                        toast.error("Failed to save report to database");
                                    }
                                }}
                            >
                                <History className="w-5 h-5 mr-2" />
                                Save to History
                            </Button>
                            <Button onClick={() => window.print()} className="bg-rose-600 hover:bg-rose-700 text-white">
                                <Download className="w-5 h-5 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
