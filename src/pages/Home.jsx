import { useState, useEffect } from 'react';
import { fetchAIResponse } from '../services/aiService';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { parseAIResponse } from '../utils/aiParser';
import { SYSTEM_INSTRUCTION } from '../utils/constants';
import MedicineCard from '../components/features/MedicineCard';
import FileUpload from '../components/ui/FileUpload';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [sources, setSources] = useState([]);

    const { isListening, transcript, startListening, error: voiceError } = useVoiceSearch();

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    useEffect(() => {
        if (voiceError) {
            toast.error(voiceError);
        }
    }, [voiceError]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResults(null);
        setSources([]);

        try {
            const { text, sources: responseSources } = await fetchAIResponse(
                query,
                SYSTEM_INSTRUCTION
            );

            const parsedData = parseAIResponse(text);
            setResults(parsedData);
            setSources(responseSources);
            toast.success('Search completed');
        } catch (error) {
            console.error("Search failed:", error);
            toast.error(error.message || "Failed to fetch results. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceSearch = () => {
        if (isListening) return;
        startListening();
        toast('Listening...', { icon: '🎙️' });
    };

    const handlePrescriptionUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            toast.success(`Rx Uploaded: ${file.name}`);
            console.log("Upload:", file);
            // Simulate processing
            setTimeout(() => {
                toast("Prescription analysis coming in next update!", { icon: '👨‍⚕️' });
            }, 1000);
        }
    };

    return (
        <div className="pb-24 lg:pb-0">
            {/* Pull-to-Refresh Indicator Placeholder */}
            <div id="ptrIndicator" className="text-center p-2 text-sm text-gray-500 dark:text-gray-400 opacity-0 transition-opacity duration-300 lg:hidden">
                <div className="spinner mx-auto hidden bg-gray-500 w-6 h-6 border-2 border-t-2 border-t-emerald-500"></div>
                <span>Pull down to refresh...</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Search & Results */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Search Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-colors duration-300">
                        <label htmlFor="queryInput" className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                            Check Symptoms or Find Medicines
                        </label>
                        <input
                            type="text"
                            id="queryInput"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="E.g., Paracetamol 500mg or Fever and sore throat..."
                            className="w-full p-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base shadow-sm"
                        />

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={handleSearch}
                                disabled={isLoading}
                                className="submit-button flex-1 min-w-[120px] flex justify-center items-center px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 disabled:bg-gray-400 transition-all shadow-md"
                            >
                                <span>{isLoading ? 'Searching...' : 'Search'}</span>
                                {isLoading && <div className="spinner ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            </button>

                            <button
                                onClick={handleVoiceSearch}
                                disabled={isListening}
                                className={`flex justify-center items-center px-4 py-3 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:bg-gray-400 transition-all shadow-md`}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7v1a3 3 0 003-3 3 3 0 00-3-3m0 0a7 7 0 01-7-7m7 7l-2 2m2-2l2 2m7-2h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"></path></svg>
                                {isListening ? 'Listening' : 'Voice'}
                            </button>

                            <div className="w-full mt-4">
                                <FileUpload
                                    onUploadSuccess={(response) => {
                                        toast.success(`Uploaded: ${response.file.filename}`);
                                        // Simulate analysis
                                        setTimeout(() => {
                                            toast("AI Analysis Ready! (Simulation)", { icon: '🧠' });
                                        }, 1000);
                                    }}
                                    label="Upload Prescription / Medicine / Symptoms"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search Results */}
                    <MedicineCard data={results} sources={sources} isVisible={!!results} />
                </div>

                {/* Right Column: Features & Quick Links */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 hidden lg:block">Quick Actions</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                        <button
                            onClick={() => navigate('/pharmacy')}
                            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-400 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-teal-500 hover:to-teal-700 submit-button transition-all transform hover:scale-[1.02] cursor-pointer"
                        >
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-base">Find Pharmacy</span>
                            <span className="text-xs opacity-75 mt-1 font-light">Locate stores near you</span>
                        </button>
                        <button
                            onClick={() => navigate('/claims')}
                            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-orange-700 submit-button transition-all transform hover:scale-[1.02] cursor-pointer"
                        >
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v13m-7 0h14a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span className="text-base">Claims Detector</span>
                            <span className="text-xs opacity-75 mt-1 font-light">Verify medical bills</span>
                        </button>
                    </div>

                    {/* Desktop-only extra content (Placeholder for now) */}
                    <div className="hidden lg:block bg-blue-50 dark:bg-gray-700/50 p-4 rounded-xl border border-blue-100 dark:border-gray-600">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Did you know?</h4>
                        <p className="text-sm text-blue-600 dark:text-gray-300">
                            You can upload a prescription photo to get instant interaction warnings!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
