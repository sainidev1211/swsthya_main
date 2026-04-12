import React, { useState } from 'react';
// Supabase client removed. Using MongoDB now
import { aiBackendSystem } from '../services/aiUploadService';

export default function TestUpload() {
  const [filesData, setFilesData] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Use AI System for Both Upload + Save
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    // Test payload defined in the system role request
    const username = "dev_browser_test";
    const password = "test_password";
    const age = 21;

    const result = await aiBackendSystem.processUserUpload(file, username, password, age);

    if (result.success) {
      alert("✅ " + result.message);
    } else {
      alert("❌ " + result.message);
    }
    
    setUploading(false);
  }

  // 6. FETCH DATA (SHOW IN UI)
  async function getFiles() {
    // Standard retrieve or use AI system retrieve support
    const result = await aiBackendSystem.fetchUserData();

    if (!result.success) {
        console.error("Fetch error.");
    } else {
        console.log("Fetched data:", result.data);
        setFilesData(result.data || []);
    }
  }

  async function forceInsertTest() {
    const username = "force_test";
    const password = "111";
    const age = 22;

    const result = await aiBackendSystem.processUserUpload(
      new File([""], "dummy.txt", { type: "text/plain" }), 
      username, 
      password, 
      age
    );

    console.log("FORCE:", result);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Test File Upload</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Upload a File</h2>
        <input 
          type="file" 
          onChange={handleUpload} 
          disabled={uploading}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-emerald-50 file:text-emerald-700
            dark:file:bg-emerald-900/30 dark:file:text-emerald-400
            hover:file:bg-emerald-100 dark:hover:file:bg-emerald-800/40 mb-4"
        />
        {uploading && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Uploading...</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Force Database Insert</h2>
        <button 
            type="button"
            onClick={forceInsertTest}
            className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition"
        >
            Run Force Insert (Direct to DB)
        </button>
        <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">👉 Run this WITHOUT upload to verify DB works</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Fetch Files</h2>
        <button 
            onClick={getFiles}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
            Fetch Data
        </button>

        {filesData.length > 0 && (
            <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Database Records:</h3>
                <ul className="space-y-3">
                    {filesData.map((item, index) => (
                        <li key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm border border-gray-100 dark:border-gray-600 break-words text-gray-800 dark:text-gray-200">
                            <p><strong>Username:</strong> {item.username || item.username || 'N/A'}</p>
                            <p><strong>Age:</strong> {item.age || item.Age || 'N/A'}</p>
                            {item.file_url ? (
                                <p>
                                    <strong>File:</strong> <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{item.file_url}</a>
                                </p>
                            ) : (
                                <p className="text-gray-400 italic">No file URL</p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
}
