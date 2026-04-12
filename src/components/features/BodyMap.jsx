import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function BodyMap({ onSelectPart, selectedParts }) {
    const [view, setView] = useState('front'); // 'front' or 'back'

    const isSelected = (id) => selectedParts.includes(id);
    // Toggle selection (Multi Select Mode - No Auto Grouping)
    const handlePartClick = (id) => {
        if (selectedParts.includes(id)) {
            onSelectPart(selectedParts.filter(p => p !== id));
        } else {
            onSelectPart([...selectedParts, id]);
        }
    };

    const bodyParts = {
        front: [
            // Head & Neck
            { id: 'Head', name: 'Head', d: "M100,50 Q115,50 120,70 Q120,85 110,95 Q100,100 90,95 Q80,85 80,70 Q85,50 100,50", cx: 100, cy: 75 },
            { id: 'Neck', name: 'Neck', d: "M90,95 Q100,100 110,95 L115,105 Q100,110 85,105 Z", cx: 100, cy: 100 },

            // Upper Body
            { id: 'Shoulders', name: 'Shoulders', d: "M75,105 Q100,110 125,105 L130,120 Q100,125 70,120 Z", cx: 100, cy: 112 },
            { id: 'Chest', name: 'Chest', d: "M70,120 Q100,125 130,120 L128,155 Q100,165 72,155 Z", cx: 100, cy: 138 },
            { id: 'Stomach', name: 'Stomach', d: "M72,155 Q100,165 128,155 L125,190 Q100,200 75,190 Z", cx: 100, cy: 172 },
            { id: 'Pelvis', name: 'Pelvis', d: "M75,190 Q100,200 125,190 L123,210 Q100,220 77,210 Z", cx: 100, cy: 200 },

            // Arms (Left)
            { id: 'Left Arm', name: 'Left Arm', d: "M70,120 L55,130 L50,160 L65,155 Z", cx: 60, cy: 140 },
            { id: 'Left Hand', name: 'Left Hand', d: "M50,160 L45,185 L60,180 L65,155 Z", cx: 52, cy: 170 },

            // Arms (Right)
            { id: 'Right Arm', name: 'Right Arm', d: "M130,120 L145,130 L150,160 L135,155 Z", cx: 140, cy: 140 },
            { id: 'Right Hand', name: 'Right Hand', d: "M150,160 L155,185 L140,180 L135,155 Z", cx: 148, cy: 170 },

            // Legs (Left)
            { id: 'Left Thigh', name: 'Left Thigh', d: "M77,210 L75,260 L95,260 L98,215 Z", cx: 85, cy: 235 },
            { id: 'Left Knee', name: 'Left Knee', d: "M75,260 L74,280 L96,280 L95,260 Z", cx: 85, cy: 270 },
            { id: 'Left Shin', name: 'Left Shin', d: "M74,280 L72,320 L94,320 L96,280 Z", cx: 85, cy: 300 },
            { id: 'Left Foot', name: 'Left Foot', d: "M72,320 L68,340 L98,340 L94,320 Z", cx: 85, cy: 330 },

            // Legs (Right)
            { id: 'Right Thigh', name: 'Right Thigh', d: "M123,210 L125,260 L105,260 L102,215 Z", cx: 115, cy: 235 },
            { id: 'Right Knee', name: 'Right Knee', d: "M125,260 L126,280 L104,280 L105,260 Z", cx: 115, cy: 270 },
            { id: 'Right Shin', name: 'Right Shin', d: "M126,280 L128,320 L106,320 L104,280 Z", cx: 115, cy: 300 },
            { id: 'Right Foot', name: 'Right Foot', d: "M128,320 L132,340 L102,340 L106,320 Z", cx: 115, cy: 330 },
        ],
        back: [
            { id: 'Head (Rear)', name: 'Head (Rear)', d: "M100,50 Q115,50 120,70 Q120,85 110,95 Q100,100 90,95 Q80,85 80,70 Q85,50 100,50", cx: 100, cy: 65 },
            { id: 'Nape', name: 'Nape', d: "M90,95 Q100,100 110,95 L115,105 Q100,110 85,105 Z", cx: 100, cy: 100 },

            // Detailed Back
            { id: 'Upper Back', name: 'Upper Back', d: "M75,105 Q100,110 125,105 L126,145 Q100,150 74,145 Z", cx: 100, cy: 125 },
            { id: 'Lower Back', name: 'Lower Back', d: "M74,145 Q100,150 126,145 L124,180 Q100,190 76,180 Z", cx: 100, cy: 165 },
            { id: 'Glutes', name: 'Glutes', d: "M76,180 Q100,190 124,180 L123,210 Q100,220 77,210 Z", cx: 100, cy: 195 },

            // Arms (Left Back)
            { id: 'Left Arm (Rear)', name: 'Left Arm', d: "M70,120 L55,130 L50,160 L65,155 Z", cx: 60, cy: 140 },
            { id: 'Left Hand (Rear)', name: 'Left Hand', d: "M50,160 L45,185 L60,180 L65,155 Z", cx: 52, cy: 170 },

            // Arms (Right Back)
            { id: 'Right Arm (Rear)', name: 'Right Arm', d: "M130,120 L145,130 L150,160 L135,155 Z", cx: 140, cy: 140 },
            { id: 'Right Hand (Rear)', name: 'Right Hand', d: "M150,160 L155,185 L140,180 L135,155 Z", cx: 148, cy: 170 },

            // Legs (Back)
            { id: 'Left Hamstring', name: 'Left Hamstring', d: "M77,210 L76,255 L96,255 L98,215 Z", cx: 85, cy: 235 },
            { id: 'Left Calf', name: 'Left Calf', d: "M76,255 L74,310 L94,310 L96,255 Z", cx: 85, cy: 285 },
            { id: 'Left Heel', name: 'Left Heel', d: "M74,310 L72,340 L94,340 L94,310 Z", cx: 85, cy: 325 },

            { id: 'Right Hamstring', name: 'Right Hamstring', d: "M123,210 L124,255 L104,255 L102,215 Z", cx: 115, cy: 235 },
            { id: 'Right Calf', name: 'Right Calf', d: "M124,255 L126,310 L106,310 L104,255 Z", cx: 115, cy: 285 },
            { id: 'Right Heel', name: 'Right Heel', d: "M126,310 L128,340 L106,340 L106,310 Z", cx: 115, cy: 325 },
        ]
    };

    return (
        <div className="flex flex-col items-center">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                <button
                    onClick={() => setView('front')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'front' ? 'bg-white dark:bg-gray-700 shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Front View
                </button>
                <button
                    onClick={() => setView('back')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'back' ? 'bg-white dark:bg-gray-700 shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Back View
                </button>
            </div>

            {/* SVG Map */}
            <div className="relative h-[350px] w-full max-w-[300px] mx-auto">
                <svg viewBox="0 0 200 350" className="w-full h-full drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Silhouette Base */}
                    <path
                        d="M100,45 Q125,45 130,70 L160,110 L170,190 L150,190 L140,160 L145,320 L110,320 L105,240 L95,240 L60,320 L55,320 L60,160 L50,190 L30,190 L40,110 L70,70 Q75,45 100,45"
                        fill="#e5e7eb"
                        className="dark:fill-gray-800"
                    />

                    {/* Interactive Parts */}
                    {bodyParts[view].map((part) => (
                        <motion.path
                            key={part.id}
                            d={part.d}
                            onClick={() => handlePartClick(part.id)}
                            whileHover={{ scale: 1.02, filter: "url(#glow)" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`cursor-pointer transition-colors duration-300 stroke-2 ${isSelected(part.id)
                                ? 'fill-emerald-500 stroke-white'
                                : 'fill-white dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600 hover:fill-emerald-100 dark:hover:fill-emerald-900/30'
                                }`}
                        />
                    ))}

                    {/* Labels */}
                    {bodyParts[view].map((part) => (
                        <text
                            key={`label-${part.id}`}
                            x={part.cx}
                            y={part.cy}
                            textAnchor="middle"
                            className={`text-[8px] font-bold pointer-events-none uppercase ${isSelected(part.id) ? 'fill-white' : 'fill-gray-400 dark:fill-gray-500'
                                }`}
                        >
                            {isSelected(part.id) ? 'Selected' : ''}
                        </text>
                    ))}
                </svg>

                {/* Floating Hint */}
                {selectedParts.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm animate-pulse">
                        Tap to select parts
                    </div>
                )}
            </div>
        </div>
    );
}
