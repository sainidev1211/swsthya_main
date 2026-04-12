import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, ArrowLeft, ShieldCheck, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../api/config';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function ClinicalChat() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const doctor = location.state?.doctor;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef();
    const socketRef = useRef();

    const patientId = user?.id || user?._id;
    const doctorId = doctor?._id || doctor?.id;
    const SOCKET_URL = API_BASE_URL.replace('/api', '');

    useEffect(() => {
        if (!doctor) {
            toast.error("No clinical session selected.");
            navigate('/doctors');
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/chat/${patientId}/${doctorId}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setMessages(data.data);
                } else {
                    toast.error(data.message || "Could not load history");
                    navigate('/doctors');
                }
            } catch (err) {
                console.error("Chat history error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        // Initialize Socket
        socketRef.current = io(SOCKET_URL, {
            query: { userId: patientId }
        });

        socketRef.current.on('receive_message', (data) => {
            // Verify message is from the current doctor
            if (data.senderId === doctorId) {
                setMessages(prev => [...prev, {
                    ...data,
                    text: data.message
                }]);
            }
        });

        socketRef.current.on('error', (err) => {
            toast.error(err.message || "Socket error");
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [doctor, patientId, doctorId, user.token, navigate]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !doctor) return;

        const msgData = {
            senderId: patientId,
            receiverId: doctorId,
            senderRole: 'patient',
            message: input
        };

        try {
            socketRef.current.emit('send_message', msgData);

            // Optimistic update
            setMessages(prev => [...prev, {
                _id: Date.now(),
                senderId: patientId,
                receiverId: doctorId,
                senderRole: 'patient',
                text: input,
                createdAt: new Date()
            }]);
            setInput('');
        } catch (err) {
            toast.error("Failed to send message");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-medical-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold">Connecting to Clinical Server...</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between py-4 border-b dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                            {doctor.fullName?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-black text-gray-900 dark:text-white leading-none">Dr. {doctor.fullName}</h2>
                            <p className="text-xs text-medical-600 font-bold mt-1 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Secure Clinical Link
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 px-2 no-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                            <Bot className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-400 font-medium">No previous messages. You can start the consultation.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex ${msg.senderRole === 'patient' || msg.senderId === patientId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] flex flex-col gap-1 ${msg.senderRole === 'patient' || msg.senderId === patientId ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                                msg.senderRole === 'patient' || msg.senderId === patientId
                                    ? 'bg-medical-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                            <div className="flex items-center gap-1.5 px-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {(msg.senderRole === 'patient' || msg.senderId === patientId) && <CheckCheck className="w-3 h-3 text-medical-500" />}
                            </div>
                        </div>
                    </motion.div>
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="py-6 px-2">
                <form onSubmit={handleSend} className="flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm font-medium dark:text-white"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-12 h-12 p-0 flex items-center justify-center bg-medical-600 hover:bg-medical-700 rounded-xl"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
