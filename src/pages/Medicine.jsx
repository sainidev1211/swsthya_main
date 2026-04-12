import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, ExternalLink, Pill } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Medicine() {
    const [searchTerm, setSearchTerm] = useState('Dolo 650');

    const handleCompare = (pharmacy) => {
        if (!searchTerm) return;
        let url = '';
        const query = encodeURIComponent(searchTerm);

        if (pharmacy === '1mg') url = `https://www.1mg.com/search/all?name=${query}`;
        if (pharmacy === 'pharmeasy') url = `https://pharmeasy.in/search/all?name=${query}`;
        if (pharmacy === 'netmeds') url = `https://www.netmeds.com/catalogsearch/result?q=${query}`;
        if (pharmacy === 'apollo') url = `https://www.apollopharmacy.in/search-medicines/${query}`;

        window.open(url, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20 md:pb-0 text-gray-900 dark:text-white"
        >
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-medical-600 to-teal-500 bg-clip-text text-transparent mb-4">
                    Medicine Price Comparison
                </h1>
                <p className="text-gray-500 text-lg">
                    Compare prices across India's top online pharmacies in one click.
                </p>
            </div>

            <div className="max-w-2xl mx-auto mb-16 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Pill className="w-6 h-6 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter medicine name (e.g. Paracetamol, Vitamin C)..."
                    className="w-full pl-14 pr-4 py-5 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl focus:ring-4 focus:ring-medical-500/20 focus:border-medical-500 transition-all outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <PharmacyCard
                    name="Tata 1mg"
                    color="bg-[#ff6f61]"
                    logo="https://assets.1mg.com/pwa-app/production/public/img/tata_1mg_logo_new.svg"
                    onClick={() => handleCompare('1mg')}
                />
                <PharmacyCard
                    name="PharmEasy"
                    color="bg-[#10847e]"
                    logo="https://assets.pharmeasy.in/apothecary/images/logo_big.svg?dim=256x0"
                    onClick={() => handleCompare('pharmeasy')}
                />
                <PharmacyCard
                    name="Netmeds"
                    color="bg-[#32aeb1]"
                    logo="https://www.netmeds.com/assets/gloryweb/images/netmeds-logo-logo-v1.svg"
                    onClick={() => handleCompare('netmeds')}
                />
                <PharmacyCard
                    name="Apollo Pharmacy"
                    color="bg-[#fea302]"
                    logo="https://newassets.apollo247.com/images/ic_logo.png"
                    onClick={() => handleCompare('apollo')}
                />
            </div>

            <div className="mt-16 text-center">
                <p className="text-sm text-gray-400 max-w-2xl mx-auto">
                    Note: We do not sell medicines directly. We provide links to third-party pharmacies for convenience. Prices and availability are subject to the respective platforms.
                </p>
            </div>
        </motion.div>
    );
}

function PharmacyCard({ name, color, onClick, logo }) {
    return (
        <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full justify-between group"
        >
            <div className="h-16 flex items-center justify-center mb-6 w-full">
                {/* Fallback text if logo fails, but using text mostly for generic look if image breaks */}
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{name}</h3>
            </div>

            <div className={`w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-xl ${color}`}>
                Check Price <ExternalLink className="w-4 h-4" />
            </div>
        </motion.button>
    )
}
