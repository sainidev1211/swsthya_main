import { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export default function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Camera access denied or unavailable.");
            console.error("Camera Error:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureImage = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        const imageUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageUrl);
        stopCamera();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">

                <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-lg">Scan Medicine / Symptom</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative aspect-[4/3] bg-black">
                    {!error ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 flex justify-center gap-4">
                    {!error ? (
                        <Button
                            onClick={captureImage}
                            className="w-16 h-16 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-500" />
                        </Button>
                    ) : (
                        <Button onClick={onClose} variant="outline">Close Scanner</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
