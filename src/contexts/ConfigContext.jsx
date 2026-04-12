import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({
        websiteName: 'Swasthya',
        logoUrl: '',
        themeColorPrimary: '#0d9488', // tailwind teal-600
        themeColorSecondary: '#0f766e', // tailwind teal-700
        bannerText: '',
        features: {
            aiAssistant: true,
            emergencyMode: true,
            deliveryServices: true,
            doctorConsultations: true,
            notifications: true
        }
    });

    const [loadingConfig, setLoadingConfig] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // The master backend is serving this public config schema
                const response = await axios.get(`${API_BASE_URL}/admin/config`);
                const newConfig = response.data.data;
                if (newConfig) {
                    setConfig(prev => ({
                        ...prev,
                        ...newConfig,
                        features: {
                            ...prev.features,
                            ...(newConfig.features || {})
                        }
                    }));

                    // --- DOM CSS VARIABLE INJECTION ---
                    // We overwrite Tailwind's defaults by mapping them to native CSS variables
                    document.documentElement.style.setProperty('--dynamic-primary', newConfig.themeColorPrimary || '#0d9488');
                    document.documentElement.style.setProperty('--dynamic-secondary', newConfig.themeColorSecondary || '#0f766e');
                }

            } catch (error) {
                console.error('Failed to load global configuration:', error);
            } finally {
                setLoadingConfig(false);
            }
        };

        fetchConfig();
    }, []);

    // Provide the config down the tree 
    return (
        <ConfigContext.Provider value={{ config, loadingConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};
