import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Phone, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const { fullName, age, email, mobile, password, confirmPassword } = formData;
        if (!fullName || !age || !email || !mobile || !password || !confirmPassword) {
            toast.error("All fields are mandatory");
            return false;
        }
        if (isNaN(age) || age <= 0) {
            toast.error("Please enter a valid age");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Invalid email format");
            return false;
        }
        if (mobile.length < 10) {
            toast.error("Please enter a valid mobile number");
            return false;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await signup(formData);
            toast.success("Account created successfully!");
            navigate('/login');
        } catch (error) {
            toast.error(error.message || "Signup failed");
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
                className="w-full max-w-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">Create Account</h1>
                    <p className="text-gray-500 text-sm">Join the Secure Healthcare Ecosystem</p>
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

                <form onSubmit={handleSignup} className="space-y-4">
                    <Input
                        name="fullName"
                        type="text"
                        placeholder="Full Name"
                        icon={<User className="w-4 h-4" />}
                        value={formData.fullName}
                        onChange={handleChange}
                        className="bg-white/50"
                    />
                    <Input
                        name="age"
                        type="number"
                        placeholder="Age"
                        icon={<Calendar className="w-4 h-4" />}
                        value={formData.age}
                        onChange={handleChange}
                        className="bg-white/50"
                    />
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        icon={<Mail className="w-4 h-4" />}
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-white/50"
                    />
                    <Input
                        name="mobile"
                        type="tel"
                        placeholder="Mobile Number"
                        icon={<Phone className="w-4 h-4" />}
                        value={formData.mobile}
                        onChange={handleChange}
                        className="bg-white/50"
                    />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        icon={<Lock className="w-4 h-4" />}
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-white/50"
                    />
                    <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        icon={<Lock className="w-4 h-4" />}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="bg-white/50"
                    />

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-semibold shadow-lg shadow-blue-500/20 mt-6"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

            </motion.div>
        </div>
    );
}
