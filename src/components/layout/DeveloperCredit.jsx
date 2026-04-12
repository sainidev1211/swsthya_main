import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, User, Linkedin, ExternalLink, Info } from 'lucide-react';

export default function DeveloperCredit() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-end"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="bg-gray-900/95 text-white backdrop-blur-md shadow-2xl overflow-hidden cursor-pointer border-t border-r border-l border-white/10"
                initial={{ height: 40, width: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                animate={{
                    height: isHovered ? 200 : 40,
                    width: isHovered ? 600 : "100%",
                    borderTopLeftRadius: isHovered ? 24 : 0,
                    borderTopRightRadius: isHovered ? 24 : 0,
                    marginBottom: isHovered ? 20 : 0,
                    borderRadius: isHovered ? 24 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Collapsed State (Default) */}
                <div className="h-10 flex items-center justify-center gap-2 text-xs font-medium tracking-wide uppercase text-gray-300">
                    <AlertTriangle className="w-3 h-3 text-yellow-500 animate-pulse" />
                    <span>AI may make mistakes. Always follow professional doctor advice.</span>
                    <Info className="w-3 h-3 ml-2 opacity-50" />
                </div>

                {/* Expanded State (Content) */}
                <div className="p-8 flex flex-col items-center text-center opacity-0 animate-[fadeIn_0.3s_ease-in_forwards]" style={{ animationDelay: '0.1s' }}>

                    <div className="flex w-full gap-8">
                        {/* Left: Admin Info */}
                        <div className="flex-1 flex flex-col items-center border-r border-gray-700 pr-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-3">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-white">Dev Saini</h3>
                            <p className="text-xs text-teal-400 uppercase tracking-widest mb-4">Lead Developer</p>

                            <div className="flex gap-2 w-full">
                                <a
                                    href="https://myportf-six.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" /> Portfolio
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/dev-sainii/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#0077b5] hover:bg-[#006396] rounded-lg text-xs font-medium transition-colors text-white"
                                >
                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                </a>
                            </div>
                        </div>

                        {/* Right: Emergency & Disclaimer */}
                        <div className="flex-1 flex flex-col justify-center text-left">
                            <h4 className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs mb-3">
                                <AlertTriangle className="w-4 h-4" /> Medical Disclaimer
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                "This platform uses AI for informational purposes only. It is <b className="text-white">not a substitute</b> for professional medical consultation, diagnosis, or treatment."
                            </p>

                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                                <p className="text-xs text-red-400 font-semibold">
                                    In case of medical emergency, call <b className="text-white text-sm">102 / 108</b> immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
