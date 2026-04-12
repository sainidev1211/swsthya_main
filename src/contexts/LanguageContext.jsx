import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export function useLanguage() {
    return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en'); // 'en' or 'hi'

    const toggleLanguage = (lang) => {
        setLanguage(lang);
        // You might want to update DOM classes or specific elements based on this
        // For now, we'll just track state. 
        // The original app used CSS classes to hide/show elements.
        // In React, we can conditionally render or pass this to components.
        if (lang === 'hi') {
            document.body.classList.add('lang-toggle-hi');
        } else {
            document.body.classList.remove('lang-toggle-hi');
        }
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}
