import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Loader2, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function NearestHospitalCard({ onClick }) {
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation unsupported');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchNearestHospital(position.coords.latitude, position.coords.longitude);
            },
            () => {
                setError('Location denied');
                setLoading(false);
            }
        );
    }, []);

    const fetchNearestHospital = async (lat, lng) => {
        try {
            const query = `
                [out:json];
                (
                  node["amenity"="hospital"](around:5000,${lat},${lng});
                  way["amenity"="hospital"](around:5000,${lat},${lng});
                );
                out center;
            `;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.elements && data.elements.length > 0) {
                const results = data.elements.map(place => ({
                    id: place.id,
                    name: place.tags.name || 'Unnamed Hospital',
                    phone: place.tags['phone'] || place.tags['contact:phone'] || null,
                    lat: place.lat || place.center.lat,
                    lon: place.lon || place.center.lon,
                    distance: getDistanceFromLatLonInKm(lat, lng, place.lat || place.center.lat, place.lon || place.center.lon)
                })).sort((a, b) => a.distance - b.distance);

                setHospital(results[0]); // Top 1
            } else {
                setError('No hospitals nearby');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleCall = (e, number) => {
        e.stopPropagation();
        window.location.href = `tel:${number}`;
    };

    const handleDirections = (e, lat, lng) => {
        e.stopPropagation();
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return (
        <Card
            onClick={onClick}
            className="p-6 cursor-pointer hover:scale-[1.02] transition-transform group border-transparent hover:border-gray-200 dark:hover:border-gray-700 h-full flex flex-col relative overflow-hidden"
        >
            <div className={`w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <MapPin className={`w-6 h-6 text-purple-500`} />
            </div>

            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {loading ? 'Locating...' : hospital ? hospital.name : 'Nearby Hospitals'}
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                {loading ? 'Fetching nearest center...' :
                    error ? 'Find centers on map' :
                        hospital ? `${hospital.distance.toFixed(1)} km away` : 'Find nearby centers'}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto">
                {hospital ? (
                    <>
                        <Button
                            size="xs"
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-transparent flex-1"
                            onClick={(e) => handleDirections(e, hospital.lat, hospital.lon)}
                        >
                            <Navigation className="w-3 h-3 mr-1" /> Map
                        </Button>
                        {hospital.phone && (
                            <Button
                                size="xs"
                                className="bg-green-100 text-green-700 hover:bg-green-200 border-transparent flex-1"
                                onClick={(e) => handleCall(e, hospital.phone)}
                            >
                                <Phone className="w-3 h-3 mr-1" /> Call
                            </Button>
                        )}
                    </>
                ) : (
                    <span className="text-xs text-purple-500 font-medium flex items-center">
                        View Map <ExternalLink className="w-3 h-3 ml-1" />
                    </span>
                )}
            </div>
        </Card>
    );
}
