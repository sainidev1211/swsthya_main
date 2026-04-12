import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Phone, Clock, Search, ExternalLink, AlertTriangle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MiniMap from '../components/ui/MiniMap';
import MedicalSearch from '../components/features/MedicalSearch';
import { calculateDistance } from '../utils/locationUtils'; // Assuming this util exists or I'll implement inline if simple

export default function Pharmacy() {
    const [location, setLocation] = useState(null);
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('order'); // 'order' or 'locate'

    useEffect(() => {
        fetchLocation();
    }, []);

    useEffect(() => {
        if (location) {
            fetchPharmacies(location.latitude, location.longitude);
        }
    }, [location]);

    const fetchLocation = () => {
        setLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.error("Error getting location:", error);
                // Fallback to Mumbai for demo purposes if location fails
                setLocation({ latitude: 19.0760, longitude: 72.8777 });
                // setError("Unable to retrieve your location. Showing results for Mumbai.");
                setLoading(false);
            }
        );
    };

    const fetchPharmacies = async (lat, lon) => {
        setLoading(true);
        try {
            // Overpass API query for pharmacies within 5km
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="pharmacy"](around:5000,${lat},${lon});
                  way["amenity"="pharmacy"](around:5000,${lat},${lon});
                  relation["amenity"="pharmacy"](around:5000,${lat},${lon});
                );
                out body;
                >;
                out skel qt;
            `;
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });
            const data = await response.json();

            const processedPharmacies = data.elements
                .filter(el => el.tags && el.tags.name) // Only valid pharmacies with names
                .map(el => ({
                    id: el.id,
                    name: el.tags.name,
                    address: el.tags['addr:street'] || el.tags['addr:full'] || 'Address not available',
                    phone: el.tags['phone'] || el.tags['contact:phone'],
                    opening_hours: el.tags['opening_hours'],
                    lat: el.lat || (el.center && el.center.lat), // Handle nodes vs ways
                    lon: el.lon || (el.center && el.center.lon),
                    distance: getDistanceFromLatLonInKm(lat, lon, el.lat, el.lon)
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10); // Top 10 nearest

            setPharmacies(processedPharmacies);
        } catch (err) {
            console.error("Failed to fetch pharmacies:", err);
            setError("Failed to load nearby pharmacies. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper calculate distance
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        if (!lat2 || !lon2) return 999;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d.toFixed(1);
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-24 md:pb-6 max-w-5xl mx-auto px-4 md:px-6"
        >
            <div className="text-center mb-8 md:mb-10 pt-4 md:pt-6">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 md:mb-3">
                    Pharmacy & Medicine
                </h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
                    Order medicines online or find the nearest pharmacy in seconds.
                </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex justify-center mb-6 md:mb-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('order')}
                        className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'order'
                            ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Order Online
                    </button>
                    <button
                        onClick={() => setActiveTab('locate')}
                        className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${activeTab === 'locate'
                            ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Find Near Me
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode='wait'>
                {activeTab === 'order' ? (
                    <motion.div
                        key="order"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <MedicalSearch />

                        {/* Direct Links */}
                        <div className="mt-8 md:mt-12">
                            <h3 className="text-center text-gray-400 text-xs md:text-sm font-semibold uppercase tracking-wider mb-4 md:mb-6">Trusted Partners</h3>
                            <div className="flex flex-wrap justify-center gap-4 md:gap-6 opacity-60 hover:opacity-100 transition-opacity">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/1mg_logo.png" alt="1mg" className="h-6 md:h-8 object-contain grayscale hover:grayscale-0 transition-all" />
                                <img src="https://assets.pharmeasy.in/web-assets/dist/fca22bc9.png" alt="PharmEasy" className="h-6 md:h-8 object-contain grayscale hover:grayscale-0 transition-all" />
                                <img src="https://www.netmeds.com/assets/gloryweb/images/netmeds-logo-two.svg" alt="Netmeds" className="h-6 md:h-8 object-contain grayscale hover:grayscale-0 transition-all" />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="locate"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {/* User Location Map */}
                        {location && !loading && !error && (
                            <div className="mb-6 md:mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                <h3 className="text-gray-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-emerald-600" />
                                    Your Current Location
                                </h3>
                                <div className="h-48 md:h-64 rounded-lg overflow-hidden">
                                    <MiniMap
                                        lat={location.latitude}
                                        lng={location.longitude}
                                        title="You are here"
                                    />
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500">Locating nearby pharmacies...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Location Required</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                                <Button
                                    onClick={() => window.open(`https://www.google.com/maps/search/pharmacy+near+me`, '_blank')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Search on Google Maps <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ) : pharmacies.length === 0 ? (
                            <div className="text-center py-12">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Pharmacies Found</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't find any pharmacies within 5km of your location.</p>
                                <Button
                                    onClick={() => window.open(`https://www.google.com/maps/search/pharmacy+near+me`, '_blank')}
                                    variant="outline"
                                >
                                    Try Google Maps
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {pharmacies.map((pharmacy) => (
                                    <Card key={pharmacy.id} className="hover:shadow-lg transition-all border-l-4 border-l-emerald-500 flex flex-col h-full">
                                        <div className="p-4 md:p-5 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white line-clamp-1" title={pharmacy.name}>
                                                    {pharmacy.name}
                                                </h3>
                                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                                    {pharmacy.distance} km
                                                </span>
                                            </div>

                                            <div className="space-y-2 mb-6 flex-grow">
                                                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <p className="line-clamp-2">{pharmacy.address}</p>
                                                </div>
                                                {pharmacy.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Phone className="w-4 h-4 shrink-0" />
                                                        <p>{pharmacy.phone}</p>
                                                    </div>
                                                )}
                                                {pharmacy.opening_hours && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Clock className="w-3 h-3 shrink-0" />
                                                        <p className="truncate">{pharmacy.opening_hours}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-4 h-32 md:h-40 rounded-lg overflow-hidden relative">
                                                <MiniMap lat={pharmacy.lat} lng={pharmacy.lon} title={pharmacy.name} />
                                                {/* Overlay to prevent interaction if desired, or let it be interactive */}
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                <Button
                                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lon}`, '_blank')}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm h-9 md:h-10"
                                                >
                                                    <Navigation className="w-3 h-3 mr-2" /> Directions
                                                </Button>
                                                {pharmacy.phone && (
                                                    <Button
                                                        onClick={() => window.location.href = `tel:${pharmacy.phone}`}
                                                        variant="outline"
                                                        className="h-9 w-9 md:h-10 md:w-10 p-0 flex items-center justify-center shrink-0"
                                                        title="Call Pharmacy"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
