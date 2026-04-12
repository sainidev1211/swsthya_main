import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { chatWithAI, testAIConnection } from '../services/aiService';
import { useMedical } from '../contexts/MedicalContext';

export default function Chat() {
    const { records, analysis } = useMedical();
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Medical Assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Convert messages to history format if needed, but for now just sending history
            // excluding the last user message which is 'input' (already added to UI) used in chatWithAI logic?
            // Actually chatWithAI takes (history, message). 
            // We should map existing messages to {role, content}
            const history = messages.map(m => ({
                role: m.sender === 'ai' ? 'assistant' : 'user',
                content: m.text
            }));

            const aiText = await chatWithAI(history, input, records, analysis);
            if (aiText) {
                const aiMsg = { id: Date.now() + 1, text: aiText, sender: 'ai' };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error("Empty response from AI");
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "AI Unavailable. Please check your connection.", sender: 'ai' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTyping(true);
        try {
            const res = await testAIConnection();
            alert(`Connection Successful! Response: ${JSON.stringify(res)}`);
        } catch (err) {
            alert(`Connection Failed: ${err.message}`);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto pb-20 md:pb-0">
            <div className="mb-4 text-center relative">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-medical-600 to-teal-500 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Bot className="w-6 h-6 text-medical-500" /> AI Health Assistant
                </h1>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-xl">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-end max-w-[80%] gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-medical-500' : 'bg-teal-500'}`}>
                                    {msg.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                                </div>
                                <div className={`p-3 rounded-2xl ${msg.sender === 'user'
                                    ? 'bg-medical-500 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-tl-none shadow-sm'
                                    }`}>
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 rounded-full rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-600 ml-10">
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about symptoms, medicines, or health tips..."
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-medical-500 transition-all dark:text-white"
                        />
                        <Button
                            variant="primary"
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="w-12 h-12 rounded-xl p-0 flex items-center justify-center"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
