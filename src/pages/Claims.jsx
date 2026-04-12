import React from 'react';

export default function Claims() {
    return (
        <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-orange-600 mb-4">Claims Detector</h1>
            <p className="text-gray-600 mb-8">Analyze health claims for scientific accuracy.</p>
            <div className="p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <span className="text-4xl">🕵️‍♂️</span>
                <p className="mt-4 text-sm text-gray-500">Upload a video or text to verify health claims.</p>
                <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded shadow disabled:opacity-50" disabled>
                    Upload Media (Coming Soon)
                </button>
            </div>
        </div>
    );
}
