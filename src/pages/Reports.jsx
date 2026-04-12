import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserUploads, fetchUserActivities, saveUserActivity } from '../api';

export default function Reports() {
    const [history, setHistory] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [vaccineName, setVaccineName] = useState('');
    const [vaccineDate, setVaccineDate] = useState('');

    const { user } = useAuth();

    // Data Load from MongoDB
    useEffect(() => {
        const loadHistory = async () => {
            if (user) {
                try {
                    const userId = user.id || user.uid || user.email;
                    // Fetch Uploads for History List
                    const data = await fetchUserUploads(userId);
                    setHistory(data.map(item => ({
                        id: item._id,
                        query: `Condition: ${item.metadata?.analysis_result || 'Unknown'} (File: ${item.fileName})`,
                        date: new Date(item.uploadDate).toLocaleDateString()
                    })));

                    // Fetch generic Activities for Vaccines
                    const vacData = await fetchUserActivities(userId, 'vaccination');
                    setVaccinations(vacData.map(item => ({
                        id: item._id,
                        name: item.data.name,
                        date: item.data.date
                    })));
                } catch (err) {
                    console.error("Failed to fetch history or vaccines", err);
                    toast.error("Could not load your history");
                }
            } else {
                setHistory([]);
                setVaccinations([]);
            }
        };

        // No more hardcoded data loading here, now handled by the fetch queries above
    }, [user]);

    const handleExport = () => {
        toast("Preparing PDF...", { icon: '🖨️' });
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleAddVaccine = async () => {
        if (!vaccineName || !vaccineDate) {
            toast.error("Enter vaccine name and date");
            return;
        }

        if (!user) {
            toast.error("Please login or continue as guest to save data.");
            return;
        }

        try {
            const userId = user.id || user.uid || user.email;
            const newBackendLog = await saveUserActivity(userId, 'vaccination', {
                name: vaccineName,
                date: vaccineDate
            });

            const newVac = { id: newBackendLog._id, name: vaccineName, date: vaccineDate };
            setVaccinations([...vaccinations, newVac]);
            setVaccineName('');
            setVaccineDate('');
            toast.success("Vaccination record securely saved");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save vaccination to database");
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24 print:pb-0">
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Reports & History</h2>
                <button
                    onClick={handleExport}
                    className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Export / Print
                </button>
            </div>

            {/* History Section */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow print:shadow-none print:border">
                <h3 className="font-semibold text-xl text-gray-700 dark:text-gray-300 mb-3 section-header">Search History</h3>
                <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                    {history.length > 0 ? history.map(item => (
                        <li key={item.id} className="border-b dark:border-gray-700 pb-1 last:border-0 flex justify-between">
                            <span>{item.query}</span>
                            <span className="text-xs text-gray-400">{item.date}</span>
                        </li>
                    )) : <li>No history found.</li>}
                </ul>
            </div>

            {/* Vaccination Tracker */}
            <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-xl shadow border border-blue-200 dark:border-blue-700 print:shadow-none print:border">
                <h3 className="font-semibold text-xl text-blue-800 dark:text-blue-200 mb-3 section-header border-blue-500 dark:border-blue-400">Vaccination Tracker</h3>

                <div className="flex space-x-2 mb-3 print:hidden">
                    <input
                        type="text"
                        value={vaccineName}
                        onChange={(e) => setVaccineName(e.target.value)}
                        placeholder="Vaccine Name"
                        className="p-2 border rounded text-sm w-1/2 dark:bg-gray-800 dark:text-white"
                    />
                    <input
                        type="date"
                        value={vaccineDate}
                        onChange={(e) => setVaccineDate(e.target.value)}
                        className="p-2 border rounded text-sm w-1/4 dark:bg-gray-800 dark:text-white"
                    />
                    <button onClick={handleAddVaccine} className="bg-blue-600 text-white p-2 rounded text-sm w-1/4 hover:bg-blue-700 submit-button">Add</button>
                </div>

                <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
                    {vaccinations.length > 0 ? vaccinations.map(vac => (
                        <li key={vac.id} className="flex justify-between border-b border-blue-200 dark:border-blue-800 pb-1 last:border-0">
                            <span>{vac.name}</span>
                            <span>{vac.date}</span>
                        </li>
                    )) : <li>No records found.</li>}
                </ul>
            </div>

            {/* Report Placeholders for Export */}
            <div className="bg-yellow-50 dark:bg-yellow-900/40 p-4 rounded-xl shadow border border-yellow-200 dark:border-yellow-700 print:shadow-none print:border">
                <h3 className="font-semibold text-xl text-yellow-800 dark:text-yellow-200 mb-3 section-header border-yellow-500 dark:border-yellow-400">Medical Reports</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">No reports uploaded yet.</p>
            </div>
        </div>
    );
}
