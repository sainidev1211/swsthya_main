
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import Button from './Button';

export default function MiniMap({ lat, lng, title }) {
    if (!lat || !lng) return null;

    const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
        <div className="mt-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {/* Embed Map */}
            <div className="w-full h-[200px] relative">
                <iframe
                    width="100%"
                    height="100%"
                    src={mapSrc}
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    title={title || "Location Map"}
                    className="absolute inset-0 filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                ></iframe>
            </div>

            {/* Actions Footer */}
            <div className="p-3 flex items-center justify-between bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span className="truncate max-w-[150px]">{title || "Location"}</span>
                </div>
                <Button
                    size="sm"
                    className="flex items-center gap-1 text-xs py-1.5 h-auto bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(directionsUrl, '_blank')}
                >
                    <Navigation className="w-3 h-3" />
                    Get Directions
                </Button>
            </div>
        </div>
    );
}
