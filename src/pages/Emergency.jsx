import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, ShieldAlert, Navigation, ExternalLink, AlertTriangle, Loader2, Copy, Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/config';

export default function Emergency() {
    const { user } = useAuth();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [criticalRecords, setCriticalRecords] = useState([]);

    useEffect(() => {
        if (user) {
            fetchCriticalHealthInfo();
        }
    }, [user]);

    const fetchCriticalHealthInfo = async () => {
        try {
            const API_URL = API_BASE_URL;
            const response = await fetch(`${API_URL}/medical-records?userId=${user.id || user._id}`, {
                headers: { 'x-user-id': user.id || user._id }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Emergency API Error:", errorText);
                throw new Error(`API error: ${response.status}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (err) {
                console.error("Emergency JSON Parse Error:", err);
                throw new Error("Invalid response from server");
            }

            // Filter for high priority items (Allergies or Active serious conditions)
            const critical = data.filter(r => r.type === 'Allergy' || (r.type === 'Condition' && r.status === 'Active'));
            setCriticalRecords(critical);
        } catch (error) {
            console.error('Error fetching critical info:', error);
        }
    };

    const handleCall = (number) => {
        window.location.href = `tel:${number}`;
    };

    const getLocation = () => {
        setLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                fetchHospitals(latitude, longitude);
            },
            (err) => {
                console.error(err);
                setError('Unable to retrieve your location. Please enable location services.');
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // Fetch Hospitals from Overpass API (OpenStreetMap)
    const fetchHospitals = async (lat, lng) => {
        try {
            // Query: Hospitals within 5km radius
            const query = `
                [out:json];
                (
                  node["amenity"="hospital"](around:5000,${lat},${lng});
                  way["amenity"="hospital"](around:5000,${lat},${lng});
                  relation["amenity"="hospital"](around:5000,${lat},${lng});
                );
                out center;
            `;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();

            // Transform data
            const results = data.elements.map(place => ({
                id: place.id,
                name: place.tags.name || 'Unnamed Hospital',
                address: place.tags['addr:street'] || place.tags['addr:city'] || 'Address not available',
                phone: place.tags['phone'] || place.tags['contact:phone'] || null,
                emergency: place.tags.emergency === 'yes',
                lat: place.lat || place.center.lat,
                lon: place.lon || place.center.lon,
                distance: getDistanceFromLatLonInKm(lat, lng, place.lat || place.center.lat, place.lon || place.center.lon).toFixed(1)
            })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 3); // Top 3

            setHospitals(results);
        } catch (err) {
            console.error('API Error:', err);
            setError('Failed to fetch hospital data. Please use Google Maps fallback.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Distance (Haversine Formula)
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Auto-get location on mount
    useEffect(() => {
        getLocation();
    }, []);

    const openGoogleMaps = (query) => {
        const url = location
            ? `https://www.google.com/maps/search/${query}/@${location.lat},${location.lng},14z`
            : `https://www.google.com/maps/search/${query}`;
        window.open(url, '_blank');
    };

    const openDirections = (lat, lng) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const emergencyNumbers = [
        { number: '112', label: 'Ambulance', icon: Heart, color: 'bg-red-600', hover: 'hover:bg-red-700', shadow: 'shadow-red-600/20' },
        { number: '108', label: 'Emergency', icon: AlertTriangle, color: 'bg-orange-600', hover: 'hover:bg-orange-700', shadow: 'shadow-orange-600/20' },
        { number: '100', label: 'Police', icon: ShieldAlert, color: 'bg-blue-600', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-600/20' },
        { number: '101', label: 'Fire', icon: AlertTriangle, color: 'bg-amber-600', hover: 'hover:bg-amber-700', shadow: 'shadow-amber-600/20' },
        { number: '1091', label: 'Women Helpline', icon: Heart, color: 'bg-pink-600', hover: 'hover:bg-pink-700', shadow: 'shadow-pink-600/20' },
    ];

    if (user?.emergencyContact) {
        emergencyNumbers.unshift({
            number: user.emergencyContact,
            label: 'My Emergency Contact',
            icon: Phone,
            color: 'bg-teal-600',
            hover: 'hover:bg-teal-700',
            shadow: 'shadow-teal-600/20'
        });
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-20 pt-4 md:pt-6 px-4 md:px-6">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 md:mb-10"
            >
                <div className="inline-flex items-center justify-center p-3 md:p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-3 md:mb-4 animate-pulse">
                    <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-red-600 dark:text-red-500 tracking-tight mb-2">
                    EMERGENCY SOS
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 px-4">
                    Direct access to national emergency services and nearby hospitals.
                </p>
            </motion.div>

            {/* 1. Emergency Numbers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                {emergencyNumbers.map((item) => (
                    <div key={item.number} className={`relative rounded-2xl overflow-hidden shadow-xl ${item.shadow} group transition-all hover:scale-[1.02]`}>
                        <Button
                            onClick={() => handleCall(item.number)}
                            className={`w-full h-28 md:h-32 text-xl md:text-2xl ${item.color} ${item.hover} text-white flex flex-col items-center justify-center gap-2`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-6 h-6 md:w-8 md:h-8 group-hover:animate-bounce" />
                                <span className="font-bold">Call {item.number}</span>
                            </div>
                            <span className="text-xs md:text-sm font-medium opacity-90">{item.label}</span>
                        </Button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(item.number);
                                toast.success(`Copied ${item.number}`);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors"
                            title="Copy Number"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* 2. Nearest Hospital (Location Based) */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
                <div className="p-5 md:p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-medical-600" />
                            Nearest Hospitals
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {location ? 'Real-time list of nearest centers.' : 'Locating real hospitals near you based on GPS.'}
                        </p>
                    </div>

                    {!location && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={getLocation}
                            disabled={loading}
                            className="bg-gray-50 dark:bg-gray-700 w-full md:w-auto justify-center"
                        >
                            <Navigation className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Locating...' : 'Enable Location'}
                        </Button>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-5 md:p-8 bg-gray-50/50 dark:bg-gray-900/50">
                    {/* Error State */}
                    {error && (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Results List */}
                    {hospitals.length > 0 ? (
                        <div className="space-y-4">
                            {hospitals.map(hospital => (
                                <Card key={hospital.id} className="p-4 border border-gray-100 dark:border-gray-700 hover:border-medical-500 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">{hospital.name}</h3>
                                                <span className="text-[10px] md:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                                    {hospital.distance} km
                                                </span>
                                            </div>
                                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 shrink-0" /> {hospital.address}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 md:self-center">
                                            <Button
                                                size="sm"
                                                className="bg-medical-50 text-medical-700 hover:bg-medical-100 dark:bg-gray-700 dark:text-white border-transparent flex-1 md:flex-none text-xs md:text-sm"
                                                onClick={() => openDirections(hospital.lat, hospital.lon)}
                                            >
                                                <Navigation className="w-3 h-3 mr-2" /> Directions
                                            </Button>
                                            {hospital.phone && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 md:flex-none text-xs md:text-sm"
                                                    onClick={() => handleCall(hospital.phone)}
                                                >
                                                    <Phone className="w-3 h-3 mr-2" /> Call
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            <div className="text-center pt-2">
                                <Button
                                    size="sm"
                                    className="text-gray-500 hover:text-gray-700 w-full md:w-auto"
                                    onClick={() => openGoogleMaps('hospitals')}
                                >
                                    View More on Google Maps <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        </div>
                    ) : location && !loading && !error ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No hospitals found in immediate vicinity.</p>
                            <Button onClick={() => openGoogleMaps('hospitals nearby')}>
                                Search Manually on Google Maps <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    ) : null}

                    {/* Fallback View (Map) if Location exists but list empty or just preferred visual */}
                    {location && hospitals.length === 0 && !error && (
                        <div className="w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 relative group mt-6">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                title="Hospitals Near Me"
                                src={`https://maps.google.com/maps?q=hospitals&sll=${location.lat},${location.lng}&z=14&output=embed`}
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    )}

                    {/* Fallback if no location */}
                    {!location && !loading && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Location Required</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm md:text-base">
                                Enable location services to see a live map of hospitals near you, or search manually on Google Maps.
                            </p>
                            <Button onClick={() => openGoogleMaps('hospitals nearby')}>
                                Search Manually on Google Maps <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
                    <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-medium">
                        Swasthya does not store your location data. It is used only for this session.
                    </p>
                </div>
            </div>

            {/* 3. Personal Critical Health Info */}
            {criticalRecords.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 md:mt-12 bg-rose-600 rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Heart size={150} className="fill-white" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8" /> Critical Medical Info
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {criticalRecords.map((record, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500/50 px-2 py-0.5 rounded">
                                            {record.type}
                                        </span>
                                        <span className="text-xs font-bold opacity-75">{new Date(record.diagnosedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-xl font-bold">{record.title}</h4>
                                    {record.notes && <p className="text-xs mt-2 opacity-90 italic">"{record.notes}"</p>}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/20 text-center">
                            <p className="text-sm font-bold flex items-center justify-center gap-2">
                                <Phone size={16} /> Show this screen to medical responders in case of emergency.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
