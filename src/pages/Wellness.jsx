import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Quote, Sun, Moon, Coffee, Activity, Droplets, Scale, Heart, Save, AlertCircle, ChevronRight, Clock, Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { generateDailyRoutine } from '../services/aiService';
import { fetchUserActivities, saveUserActivity } from '../api';

export default function Wellness() {
    const { user, updateUser } = useAuth();
    const [metrics, setMetrics] = useState({
        weight: '',
        height: '',
        water: '',
        systolic: '',
        diastolic: ''
    });
    const [bmi, setBmi] = useState(null);
    const [bmiCategory, setBmiCategory] = useState({ label: '', color: '' });

    // Routine Generator State
    const [routineInputs, setRoutineInputs] = useState({ age: '', lifestyle: 'Student' });
    const [routineData, setRoutineData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadLatestMetrics = async () => {
            if (user) {
                const userId = user.id || user.uid || user.email;
                try {
                    const activities = await fetchUserActivities(userId, 'wellness_metrics');
                    if (activities && activities.length > 0) {
                        // Load the most recent saved metrics
                        const latest = activities[0].data;
                        setMetrics({
                            weight: latest.weight || '',
                            height: latest.height || '',
                            water: latest.water || '',
                            systolic: latest.systolic || '',
                            diastolic: latest.diastolic || '',
                        });
                    }
                } catch (e) {
                    console.error("Failed to load wellness metrics", e);
                }
                // Backwards compatibility with AuthContext update
                setMetrics(prev => ({
                    ...prev,
                    weight: prev.weight || user.weight || '',
                    height: prev.height || user.height || '',
                }));
            }
        };
        loadLatestMetrics();
    }, [user]);

    useEffect(() => {
        if (metrics.weight && metrics.height) {
            const heightInMeters = metrics.height / 100;
            const bmiValue = (metrics.weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(bmiValue);

            let category = '';
            let color = '';
            if (bmiValue < 18.5) { category = 'Underweight'; color = 'text-blue-500'; }
            else if (bmiValue < 24.9) { category = 'Normal Weight'; color = 'text-green-500'; }
            else if (bmiValue < 29.9) { category = 'Overweight'; color = 'text-orange-500'; }
            else { category = 'Obese'; color = 'text-red-500'; }
            setBmiCategory({ label: category, color });
        } else {
            setBmi(null);
        }
    }, [metrics.weight, metrics.height]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMetrics(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!user) {
            toast.error("Please login or continue as guest to save data.");
            return;
        }

        try {
            const userId = user.id || user.uid || user.email;
            await saveUserActivity(userId, 'wellness_metrics', metrics);

            // Also update AuthContext cache just in case we use it elsewhere
            if (!user.isGuest) {
                await updateUser(metrics);
            }
            toast.success("Health metrics securely saved to database!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save data to database.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="text-center mb-8 pt-8">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    Wellness <span className="text-emerald-600">Hub</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    Track your vitals, calculate your health metrics, and find daily inspiration for a better you.
                </p>
            </div>

            {/* Daily Quote */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-8 md:p-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white shadow-xl overflow-hidden mx-4 md:mx-0"
            >
                <Quote className="absolute top-4 left-6 w-12 h-12 text-white/20" />
                <blockquote className="relative z-10 text-center max-w-3xl mx-auto">
                    <p className="text-2xl md:text-3xl font-serif italic mb-6 leading-relaxed">"To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear."</p>
                    <footer className="font-bold opacity-90 text-lg">— Buddha</footer>
                </blockquote>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl" />
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 px-4 md:px-0">
                {/* Health Calculator */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Health Calculator</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-gray-400" /> Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={metrics.weight}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-gray-400" /> Height (cm)
                                </label>
                                <input
                                    type="number"
                                    name="height"
                                    value={metrics.height}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                                />
                            </div>
                        </div>

                        {/* BMI Result Display */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-600 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Body Mass Index</p>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                                    {bmi || '--'} <span className="text-sm font-medium text-gray-400">BMI</span>
                                </div>
                            </div>
                            {bmi && (
                                <div className={`text-right ${bmiCategory.color}`}>
                                    <p className="font-bold">{bmiCategory.label}</p>
                                    <p className="text-xs opacity-80">Category</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-blue-400" /> Daily Water Intake (Liters)
                            </label>
                            <input
                                type="number"
                                name="water"
                                value={metrics.water}
                                onChange={handleChange}
                                step="0.1"
                                placeholder="0.0"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-400" /> Blood Pressure (mmHg)
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    name="systolic"
                                    value={metrics.systolic}
                                    onChange={handleChange}
                                    placeholder="Sys (120)"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-mono text-center"
                                />
                                <span className="text-2xl text-gray-300 font-light">/</span>
                                <input
                                    type="number"
                                    name="diastolic"
                                    value={metrics.diastolic}
                                    onChange={handleChange}
                                    placeholder="Dia (80)"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-mono text-center"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSave}
                            className="w-full py-4 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {user?.isGuest ? 'Sign Up to Save Report' : 'Save Health Data'}
                        </Button>
                    </div>
                </motion.div>

                {/* Info Cards & Tips */}
                <div className="space-y-6">
                    {/* Vitals Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-500" /> Know Your Vitals
                        </h3>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-rose-700 dark:text-rose-300">Hemoglobin</h4>
                                    <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-rose-600 shadow-sm">g/dL</span>
                                </div>
                                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                                    <p className="flex justify-between"><span>Men:</span> <span className="font-mono font-medium">13.5 - 17.5</span></p>
                                    <p className="flex justify-between"><span>Women:</span> <span className="font-mono font-medium">12.0 - 15.5</span></p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-blue-700 dark:text-blue-300">Blood Pressure</h4>
                                    <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-blue-600 shadow-sm">mmHg</span>
                                </div>
                                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                                    <p className="flex justify-between"><span>Normal:</span> <span className="font-mono font-medium">120/80</span></p>
                                    <p className="flex justify-between"><span>Elevated:</span> <span className="font-mono font-medium">120-129/&lt;80</span></p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-amber-700 dark:text-amber-300">Blood Sugar (Fasting)</h4>
                                    <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-amber-600 shadow-sm">mg/dL</span>
                                </div>
                                <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                                    <p className="flex justify-between"><span>Normal:</span> <span className="font-mono font-medium">70 - 100</span></p>
                                    <p className="flex justify-between"><span>Pre-Diabetes:</span> <span className="font-mono font-medium">100 - 125</span></p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Daily Routine Generator */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Routine Generator</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            Get a personalized daily schedule tailored to your lifestyle and age to maximize productivity and health.
                        </p>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Your Age
                            </label>
                            <input
                                type="number"
                                value={routineInputs.age}
                                onChange={(e) => setRoutineInputs({ ...routineInputs, age: e.target.value })}
                                placeholder="e.g. 25"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Lifestyle Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Student', 'Worker', 'Gym Freak', 'Parent', 'Retired'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setRoutineInputs({ ...routineInputs, lifestyle: type })}
                                        className={`p-3 rounded-xl border transition-all text-sm font-medium ${routineInputs.lifestyle === type
                                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={async () => {
                                if (!routineInputs.age) {
                                    toast.error("Please enter your age first.");
                                    return;
                                }
                                setIsGenerating(true);
                                try {
                                    const data = await generateDailyRoutine(routineInputs.age, routineInputs.lifestyle, user?.gender || 'Not specified');
                                    setRoutineData(data);
                                    toast.success("Personalized routine generated!");
                                } catch (error) {
                                    console.error(error);
                                    toast.error("Failed to generate routine. Try again.");
                                } finally {
                                    setIsGenerating(false);
                                }
                            }}
                            disabled={isGenerating}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? 'Designing Your Day...' : 'Generate Routine'} <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Sun className="w-5 h-5 text-amber-500" />
                            {routineData ? `Your ${routineInputs.lifestyle} Schedule` : 'Recommended Schedule'}
                        </h3>

                        {!routineData && !isGenerating && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <Clock className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500">Enter your details and click Generate to see your personalized AI timetable here.</p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-sm text-gray-500 animate-pulse">Consulting wellness experts...</p>
                            </div>
                        )}

                        {routineData && (
                            <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700 pl-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                {routineData.schedule.map((item, idx) => {
                                    const Icon = {
                                        droplets: Droplets, activity: Activity, coffee: Coffee,
                                        sun: Sun, moon: Moon, heart: Heart, brain: Brain
                                    }[item.icon] || Clock;

                                    const color = {
                                        droplets: 'text-blue-500', activity: 'text-emerald-500', coffee: 'text-orange-500',
                                        sun: 'text-amber-500', moon: 'text-indigo-500', heart: 'text-rose-500', brain: 'text-purple-500'
                                    }[item.icon] || 'text-gray-500';

                                    return (
                                        <div key={idx} className="relative group">
                                            <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 group-hover:border-purple-500 transition-colors`} />
                                            <p className="text-xs font-bold text-gray-400 mb-0.5">{item.time}</p>
                                            <div className="flex items-start gap-2">
                                                <Icon className={`w-4 h-4 ${color} mt-0.5 shrink-0`} />
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-snug">{item.task}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {routineData.nutritional_focus && (
                                    <div className="mt-6 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-xs">
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Nutrition Tip:</span>
                                        <span className="text-emerald-800 dark:text-emerald-300">{routineData.nutritional_focus}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Routine Tips (Existing) */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white px-4 md:px-0">Healthy Habits</h3>
            <div className="grid md:grid-cols-3 gap-6 px-4 md:px-0">
                <Card className="p-6 bg-orange-50 dark:bg-orange-900/10 border-orange-100 hover:shadow-lg transition-shadow">
                    <Sun className="w-8 h-8 text-orange-500 mb-4" />
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Morning Routine</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start with a glass of warm water and 5 minutes of stretching to wake up your body.</p>
                </Card>
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 hover:shadow-lg transition-shadow">
                    <Coffee className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Mid-Day Break</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Take a 20-20-20 eye break: Every 20 mins, look at something 20 feet away for 20 seconds.</p>
                </Card>
                <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 hover:shadow-lg transition-shadow">
                    <Moon className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Sleep Hygiene</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avoid screens 1 hour before bed using a "Digital Sunset" routine.</p>
                </Card>
            </div>
        </div>
    );
}
