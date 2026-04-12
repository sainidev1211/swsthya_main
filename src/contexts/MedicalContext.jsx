import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL, SOCKET_URL } from '../api/config';

const MedicalContext = createContext();

export function useMedical() {
    return useContext(MedicalContext);
}

const API_URL = API_BASE_URL;

export function MedicalProvider({ children }) {
    const { user, isGuest } = useAuth();
    const [records, setRecords] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    const isRestricted = isGuest || !user;

    useEffect(() => {
        if (!isRestricted) {
            fetchRecords();
            fetchLatestAnalysis();
        } else {
            setRecords([]);
            setAnalysis(null);
            setLoading(false);
        }
    }, [isRestricted]);

    const getUserId = () => user?.uuid || user?._id || user?.id || 'guest';

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const userId = getUserId();
            if (userId === 'guest') {
                setRecords([]);
                setLoading(false);
                return;
            }
            
            const res = await fetch(`${API_URL}/users/${userId}`);
            if (!res.ok) throw new Error(`Fetch records failed: ${res.status}`);
            
            let result;
            try {
                result = await res.json();
            } catch (e) {
                throw new Error("Invalid JSON from server");
            }
            
            if (!result.success) throw new Error(result.message);
            const data = result.data.uploads || [];
            
            if (data && data.length > 0) {
                const parsedData = data.map(record => {
                    return {
                        _id: record._id,
                        file_url: record.file_url,
                        file_name: record.file_name,
                        file_type: record.file_type,
                        uploaded_at: record.uploaded_at,
                        ...(record.metadata || {}),
                        ai_result: record.ai_result
                    };
                });

                const sortOrder = { 'Active': 1, 'Recent': 2, 'Past': 3, 'Recovered': 4, 'Recurring': 5 };
                const sortedRecords = parsedData.sort((a, b) => {
                    const statusDiff = (sortOrder[a.status] || 99) - (sortOrder[b.status] || 99);
                    if (statusDiff !== 0) return statusDiff;
                    // Provide fallback dates just in case
                    const dateA = a.diagnosedAt ? new Date(a.diagnosedAt) : new Date(0);
                    const dateB = b.diagnosedAt ? new Date(b.diagnosedAt) : new Date(0);
                    return dateB - dateA;
                });
                setRecords(sortedRecords);
            } else {
                setRecords([]);
            }
        } catch (error) {
            console.error('Error fetching records from MongoDB API:', error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestAnalysis = async () => {
        try {
            const userId = getUserId();
            const storedAnalysis = localStorage.getItem(`AIAnalysis_${userId}`);
            if (storedAnalysis) {
                setAnalysis(JSON.parse(storedAnalysis));
            } else {
                setAnalysis(null);
            }
        } catch (error) {
            console.error('Error fetching latest analysis from local storage:', error);
        }
    };

    const saveAnalysisLocally = (newAnalysis) => {
        try {
            const userId = getUserId();
            localStorage.setItem(`AIAnalysis_${userId}`, JSON.stringify(newAnalysis));
            setAnalysis(newAnalysis);
            return true;
        } catch (error) {
            console.error('Error saving analysis to local storage:', error);
            return false;
        }
    };

    const addRecord = async (newRecordData) => {
        try {
            const userId = getUserId();
            let fileUrl = null;
            let finalFileName = null;
            let finalFileType = null;

            // Handle API File Upload
            if (newRecordData.rawFile) {
                const formData = new FormData();
                formData.append('file', newRecordData.rawFile);

                const res = await fetch(`${API_URL}/uploads/file`, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

                let data;
                try {
                   data = await res.json();
                } catch (e) {
                   throw new Error("Invalid JSON from server during upload");
                }

                if (!data.success) {
                    console.error('Upload Error:', data.message);
                    throw new Error(data.message);
                }
                
                fileUrl = `${SOCKET_URL}${data.data.file_url}`;
                finalFileName = newRecordData.rawFile.name;
                finalFileType = newRecordData.rawFile.type;
            }

            // Clean up non-database fields before inserting
            const { rawFile, attachments, ...cleanRecordData } = newRecordData;
            
            const uploadData = {
                file_name: finalFileName || 'Manual Entry',
                file_type: finalFileType || 'Manual',
                file_url: fileUrl,
                metadata: cleanRecordData
            };

            const res = await fetch(`${API_URL}/users/save-user-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, uploadData })
            });
                
            if (!res.ok) throw new Error(`Save data failed: ${res.status}`);

            let result;
            try {
                result = await res.json();
            } catch (e) {
                throw new Error("Invalid JSON from server during save");
            }
            if (!result.success) throw new Error(result.message);

            await fetchRecords(); // Refresh state
            return { success: true, data: result.data };
        } catch (error) {
            console.error('Error adding record to API:', error);
            return { success: false, error: 'Failed to save record' };
        }
    };

    const deleteRecord = async (id) => {
        try {
            const userId = getUserId();
            const res = await fetch(`${API_URL}/users/${userId}/uploads/${id}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

            let result;
            try {
                result = await res.json();
            } catch (e) {
                throw new Error("Invalid JSON from server during delete");
            }
            if (!result.success) throw new Error(result.message);

            await fetchRecords(); // Refresh state
            return { success: true };
        } catch (error) {
            console.error('Error deleting record:', error);
            return { success: false, error: 'Failed to delete' };
        }
    };
    
    const updateRecord = async (id, updatedData) => {
        try {
            console.warn("Update Record API not implemented.");
            return { success: false, error: 'Not implemented' };
        } catch (error) {
            console.error('Error updating record:', error);
            return { success: false, error: 'Failed to update' };
        }
    };

    const value = {
        records,
        analysis,
        setAnalysis: saveAnalysisLocally, 
        loading,
        fetchRecords,
        fetchLatestAnalysis,
        addRecord,
        deleteRecord,
        updateRecord 
    };

    return (
        <MedicalContext.Provider value={value}>
            {children}
        </MedicalContext.Provider>
    );
}
