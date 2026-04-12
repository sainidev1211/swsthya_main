import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(identifier, password);
            navigate('/');
            toast.success("Welcome back!");
        } catch (error) {
            toast.error(error.message || "Invalid credentials");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">Swasthya</h1>
                    <p className="text-gray-500 text-sm">Secure Healthcare Ecosystem</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="relative flex-1 py-2 text-sm font-medium transition-colors"
                    >
                        <span className={`relative z-10 ${location.pathname === '/login' ? 'text-teal-600 font-bold' : 'text-gray-500'}`}>Sign In</span>
                        {location.pathname === '/login' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white dark:bg-gray-600 rounded-lg shadow-sm"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="relative flex-1 py-2 text-sm font-medium transition-colors"
                    >
                        <span className={`relative z-10 ${location.pathname === '/signup' ? 'text-teal-600 font-bold' : 'text-gray-500'}`}>Sign Up</span>
                        {location.pathname === '/signup' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white dark:bg-gray-600 rounded-lg shadow-sm"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 mb-6">
                    <Input
                        type="text"
                        placeholder="Email or Mobile Number"
                        icon={<User className="w-4 h-4" />}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="bg-white/50"
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        icon={<Lock className="w-4 h-4" />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/50"
                    />
                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-semibold shadow-lg shadow-blue-500/20"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>


                <p className="text-center text-xs text-gray-400 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}
