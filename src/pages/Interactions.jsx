import { useState } from 'react';
import { fetchAIResponse } from '../services/aiService';
import toast from 'react-hot-toast';

export default function Interactions() {
    const [medicines, setMedicines] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleInteractionCheck = async () => {
        if (!medicines.trim() || medicines.split('\n').filter(line => line.trim()).length < 2) {
            toast.error("Please enter at least two medicines (one per line).");
            return;
        }

        setIsLoading(true);
        setResults(null);

        const systemPrompt = `
      You are a dedicated Drug Interaction Checker Expert System. Analyze the following list of medications, supplements, or common drugs: ${medicines}.
      Your task is to identify any potentially dangerous or significant drug-drug, drug-supplement, or drug-food interactions among the listed items.
      The output must be structured, simple, concise, and **bilingual**: first in simple English, followed immediately by its **Hinglish** (Romanized Hindi) translation, separated by a forward slash (/).
      
      Output MUST follow this strict markdown format:
      ## Interaction Risk
      [Overall risk level: e.g., HIGH, MEDIUM, LOW, or NONE] / [Hinglish translation of risk]
      ## Detailed Interactions Found
      - [Medicine 1] + [Medicine 2]: [Interaction description] / [Hinglish description]
      - [Medicine 3] + [Food/Supplement]: [Interaction description] / [Hinglish description]
      (If NONE, state it clearly as a bullet point).
    `.trim();

        try {
            const { text } = await fetchAIResponse(`Check interactions for: ${medicines}`, systemPrompt);

            // Parse results simply by splitting sections
            const parts = text.split(/##\s*/);
            const parsed = [];

            parts.forEach(part => {
                if (!part.trim()) return;
                const [header, ...contentLines] = part.trim().split('\n');
                if (header) {
                    parsed.push({
                        title: header.trim(),
                        content: contentLines.join('\n').trim()
                    });
                }
            });

            setResults(parsed);
            toast.success("Analysis Complete");

        } catch (error) {
            console.error("Interaction check failed:", error);
            toast.error("Interaction check failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Drug Interaction Checker</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
                <p className="text-gray-600 dark:text-gray-400">Enter a list of medicines, supplements, or common drugs (one per line) to check for potential harmful interactions.</p>

                <textarea
                    value={medicines}
                    onChange={(e) => setMedicines(e.target.value)}
                    placeholder="Paracetamol&#10;Amoxicillin&#10;Warfarin"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base h-40"
                ></textarea>

                <button
                    onClick={handleInteractionCheck}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 submit-button flex justify-center items-center disabled:bg-gray-400"
                >
                    <span>{isLoading ? 'Checking Interactions...' : 'Check Interactions'}</span>
                    {isLoading && <div className="spinner ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                </button>

                {results && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg animate-fade-in">
                        <h3 className="font-semibold text-lg text-red-800 dark:text-red-200 mb-4 section-header border-red-500 dark:border-red-400">Analysis Summary</h3>
                        <div className="space-y-4">
                            {results.map((section, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow">
                                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2 border-l-4 border-red-500 pl-2">{section.title}</h4>
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm">
                                        {section.content.split('\n').map((line, i) => {
                                            const parts = line.split('/');
                                            return (
                                                <div key={i} className="mb-2">
                                                    <p>{parts[0]}</p>
                                                    {parts[1] && <p className="text-gray-500 dark:text-gray-400 text-xs italic">{parts[1]}</p>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">AI-generated results. Always consult a doctor or pharmacist.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
