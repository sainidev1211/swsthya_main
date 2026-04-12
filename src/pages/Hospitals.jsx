import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, Phone, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import MiniMap from '../components/ui/MiniMap';

export default function Hospitals() {
    const [loading, setLoading] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch User Location on Mount
    useEffect(() => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    // Auto-fetch hospitals once location is found
                    fetchHospitals(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    console.error(err);
                    setError('Location access denied. Please enable location or search manually.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
        }
    }, []);

    // Fetch Hospitals from Overpass API (OpenStreetMap)
    const fetchHospitals = async (lat, lng) => {
        setLoading(true);
        setError(null);
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
            })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

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

    const openDirections = (lat, lng) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const handleGoogleSearch = () => {
        const query = searchTerm ? `${searchTerm} hospitals` : 'hospitals near me';
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20 md:pb-6 max-w-5xl mx-auto px-4"
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pt-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-600 to-teal-500 bg-clip-text text-transparent">
                        Find Nearby Hospitals
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Real-time availability using OpenStreetMap data.
                    </p>
                </div>
                <Button variant="outline" onClick={handleGoogleSearch}>
                    Search on Google Maps <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-medical-500" />
                    <p>Locating hospitals near you...</p>
                </div>
            )}

            {/* Error or Empty State */}
            {!loading && (error || hospitals.length === 0) && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {error ? 'Location Required' : 'No Hospitals Found Nearby'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {error || "We couldn't find any hospitals in a 5km radius using our free database. Please try the direct Google Maps search."}
                    </p>
                    <Button onClick={handleGoogleSearch} variant="primary">
                        Open Google Maps Search <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            {/* Results Grid */}
            {!loading && hospitals.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hospitals.map(hospital => (
                        <Card key={hospital.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-medical-500 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                                        {hospital.name}
                                    </h3>
                                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                        {hospital.distance} km
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    {hospital.address}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {hospital.emergency && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Emergency
                                        </span>
                                    )}
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                        General Hospital
                                    </span>
                                </div>

                                <div className="mt-4 mb-2">
                                    <MiniMap lat={hospital.lat} lng={hospital.lon} title={hospital.name} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Button
                                    className="flex-1 bg-medical-50 text-medical-700 hover:bg-medical-100 dark:bg-gray-700 dark:text-white border-transparent"
                                    onClick={() => openDirections(hospital.lat, hospital.lon)}
                                >
                                    <Navigation className="w-4 h-4 mr-2" /> Directions
                                </Button>
                                {hospital.phone && (
                                    <a
                                        href={`tel:${hospital.phone}`}
                                        className="flex-1"
                                    >
                                        <Button variant="outline" className="w-full">
                                            <Phone className="w-4 h-4 mr-2" /> Call
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </Card>
                    ))
                    }
                </div >
            )}

            {/* Footer Note */}
            {
                !loading && hospitals.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Data provided by OpenStreetMap. For critical emergencies, always call 102/108 directly.
                        </p>
                    </div>
                )
            }
        </motion.div >
    );
}
