import { useState } from 'react';

export default function FabMenu({ onAction }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleAction = (action) => {
        setIsOpen(false);
        onAction(action);
    };

    return (
        <>
            {/* FAB Menu Items */}
            <div
                id="fabMenu"
                className={`${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-[10px] pointer-events-none'} fixed right-6 bottom-[110px] z-19 width-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 space-y-2 transition-all duration-300 w-48`}
            >
                <button
                    onClick={() => handleAction('scan-medicine')}
                    className="w-full text-left flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v-1a4 4 0 014-4h8a4 4 0 014 4v1m-6 0h-4m4 0v4m0 0v-4m4 4h-4m4 0h-4m-6 0h-4"></path></svg>
                    Scan Medicine
                </button>
                <button
                    onClick={() => handleAction('scan-prescription')}
                    className="w-full text-left flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-9a2 2 0 01-2-2z"></path></svg>
                    Scan Prescription
                </button>
                <label className="w-full text-left flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition cursor-pointer">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 4v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2a3 3 0 00-3-3l-.2-.05A5.004 5.004 0 0010 3a5 5 0 00-4.99 4.98L5 8a4 4 0 002 8zM12 18v3m-3-3h6"></path></svg>
                    Upload Photo/PDF
                    <input type="file" accept="image/*, application/pdf" className="hidden" onChange={(e) => handleAction({ type: 'upload', file: e.target.files[0] })} />
                </label>
            </div>

            {/* Main FAB */}
            <button
                id="fabButton"
                onClick={toggleMenu}
                className="fixed right-6 bottom-[60px] z-20 p-4 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 submit-button transition-transform transform hover:scale-105"
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h4m-2 0V3m0 0h6m-6 0H6m14 4h-4m-4 0H8m-4 0H2m18 8v4m-4-4h-4m-4 4v-4m-4 4h4m0-8h4m-4 0h-4m-4 0H2"></path></svg>
            </button>
        </>
    );
}
