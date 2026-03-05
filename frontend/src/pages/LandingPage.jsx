import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Video, Users, BookOpen, ClipboardCheck, GraduationCap, ShieldCheck, PlayCircle, BarChart3, Database, MessageSquare, Zap } from 'lucide-react';

const LandingPage = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

    // Smoother scrolling for achor links
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">

            {/* Background Animated Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-blob" />
                <div className="absolute top-40 left-10 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-20 left-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen opacity-50 animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Navigation */}
            <nav className="fixed w-full top-0 z-50 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GraduationCap className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Learnify
                        </span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                        <a href="#roles" className="hover:text-white transition-colors">Roles</a>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link to="/login" className="group relative inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]">
                            Get Started
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-24 pb-16 lg:pb-32 overflow-hidden">

                {/* ========================================== */}
                {/* SECTION 1: HERO (Story Driven)             */}
                {/* ========================================== */}
                <section className="relative px-6 pt-20 lg:pt-32 pb-20 mx-auto max-w-7xl">
                    <div className="text-center max-w-4xl mx-auto">

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center px-3 py-1 mb-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium backdrop-blur-md"
                        >
                            <span className="flex w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2 animate-pulse" />
                            Built for modern universities, colleges, and institutions
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]"
                        >
                            Education shouldn't feel chaotic. <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                                Learnify makes it effortless.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                        >
                            One platform where administrators, teachers, and students manage classes, assignments, attendance, and live learning — without the confusion.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] flex items-center justify-center group">
                                Start Using Learnify
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white transition-all bg-slate-800/80 border border-slate-700 rounded-full hover:bg-slate-800 backdrop-blur-md flex items-center justify-center">
                                Explore Platform
                            </a>
                        </motion.div>
                    </div>

                    {/* Floating Hero UI Elements (Parallax) */}
                    <div className="relative mt-24 mb-10 h-[500px] md:h-[600px] w-full max-w-5xl mx-auto hidden sm:block">
                        {/* Main Center Video Card Mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 50 }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden backdrop-blur-3xl z-10 flex flex-col"
                        >
                            <div className="h-10 bg-slate-800/80 border-b border-slate-700/50 flex items-center px-4 space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-center items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-purple-900/20" />
                                <div className="grid grid-cols-3 gap-4 w-full h-full z-10 relative">
                                    <div className="col-span-2 row-span-2 bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 flex items-center justify-center relative shadow-inner">
                                        <Video className="w-16 h-16 text-slate-600 opacity-50 absolute" />
                                        <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop" alt="Teacher" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium border border-white/10">Prof. Smith (Teacher)</div>
                                        <div className="absolute top-3 right-3 bg-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center"><span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></span> Live</div>
                                    </div>
                                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 relative">
                                        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop" alt="Student" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] border border-white/10">Alex C.</div>
                                    </div>
                                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 relative">
                                        <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop" alt="Student" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] border border-white/10">Sarah J.</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Element 1: Attendance Card */}
                        <motion.div
                            style={{ y: y1 }}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="absolute top-20 left-0 lg:-left-20 w-64 bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Auto Logged</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-2">CS-101 Attendance</h4>
                            <div className="bg-slate-900 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 text-emerald-400">Present</span>
                                    <span className="text-sm font-bold text-emerald-400 text-white">42/45</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5">
                                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '93%' }}></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Element 2: Assignment Card */}
                        <motion.div
                            style={{ y: y2 }}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="absolute bottom-20 right-0 lg:-right-16 w-60 bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-indigo-400" />
                                </div>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">Data Structures Assignment 3</h4>
                            <p className="text-xs text-slate-400 mb-3">Due in 2 hours</p>
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-600 flex items-center justify-center overflow-hidden z-${10 - i}`}>
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center z-0 text-[10px] font-bold">+12</div>
                            </div>
                        </motion.div>

                        {/* Floating Notification */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1.2 }}
                            className="absolute -top-6 right-20 bg-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-emerald-400/50 z-30 flex items-center space-x-2"
                        >
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span className="text-xs font-bold text-white tracking-wide">SECURE</span>
                        </motion.div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 2: THE PROBLEM                     */}
                {/* ========================================== */}
                <section id="features" className="relative px-6 py-24 mx-auto max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Education Platforms Are Broken</h2>
                        <p className="text-lg text-slate-400">Managing a modern classroom requires too many tools, endless spreadsheets, and constant context switching. It doesn't have to be this way.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Database className="w-6 h-6 text-rose-400" />, title: "Too many disconnected tools", desc: "Zoom for video, Google Forms for attendance, Drive for files." },
                            { icon: <ClipboardCheck className="w-6 h-6 text-orange-400" />, title: "Manual attendance tracking", desc: "Wasting the first 15 minutes of every class calling names." },
                            { icon: <Users className="w-6 h-6 text-amber-400" />, title: "Confusing student portals", desc: "Students can't find their assignments or joining links easily." },
                            { icon: <Video className="w-6 h-6 text-red-400" />, title: "No real-time experience", desc: "Cold, disconnected video calls without proper academic features." }
                        ].map((problem, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 border border-slate-700">
                                    {problem.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{problem.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{problem.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 3: STORY SECTION                   */}
                {/* ========================================== */}
                <section id="how-it-works" className="relative px-6 py-24 mx-auto max-w-7xl overflow-hidden">
                    {/* Subtle background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <div className="relative z-10">
                            <motion.h2
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-8 leading-tight"
                            >
                                Imagine a Better <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Learning System</span>
                            </motion.h2>

                            <div className="space-y-8 mt-10">
                                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mr-5 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                        <Video className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-white mb-1">Instant Connectivity</h4>
                                        <p className="text-slate-400 leading-relaxed">Teachers start live classes effortlessly. <span className="text-indigo-300">Students join instantly.</span></p>
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <ClipboardCheck className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-white mb-1">Automated Organization</h4>
                                        <p className="text-slate-400 leading-relaxed"><span className="text-emerald-300">Attendance marks automatically.</span> Assignments are shared in seconds, keeping everything organized.</p>
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mr-5 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                        <Zap className="w-6 h-6 text-rose-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-white mb-1">Zero Friction</h4>
                                        <p className="text-slate-400 leading-relaxed">No spreadsheets. No confusion. No wasted time.</p>
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.7 }} className="pt-6 mt-6 border-t border-slate-800">
                                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                        Just learning.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Abstract UI Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 30 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative h-[500px] w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl"
                        >
                            {/* Fake UI Header */}
                            <div className="h-12 border-b border-slate-700/50 bg-slate-800/50 flex items-center px-4 space-x-4">
                                <div className="flex space-x-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                </div>
                                <div className="flex-1 h-6 bg-slate-900 rounded-md border border-slate-700 flex items-center px-3">
                                    <div className="w-32 h-2 bg-slate-700 rounded-full" />
                                </div>
                            </div>

                            <div className="p-6 flex flex-col gap-4 h-full relative">
                                {/* Fake Notification Line */}
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="w-full h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center px-4 space-x-4"
                                >
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-24 h-2.5 bg-emerald-400/50 rounded-full mb-2" />
                                        <div className="w-48 h-2 bg-slate-600 rounded-full" />
                                    </div>
                                </motion.div>

                                {/* Fake Live Video Panel */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.6 }}
                                    className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center group"
                                >
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                                        <Video className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div className="absolute top-4 left-4 flex space-x-2">
                                        <div className="px-2 py-1 rounded bg-black/50 text-[10px] text-white border border-white/10 backdrop-blur-sm">Classroom</div>
                                        <div className="w-16 h-5 rounded bg-slate-800/80 border border-slate-700 backdrop-blur-sm" />
                                    </div>
                                </motion.div>

                                <div className="grid grid-cols-2 gap-4 h-24">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.8 }}
                                        className="bg-slate-800/50 rounded-xl border border-slate-700 p-4"
                                    >
                                        <div className="w-6 h-6 rounded bg-blue-500/20 mb-2 flex items-center justify-center"><Users className="w-3 h-3 text-blue-400" /></div>
                                        <div className="w-16 h-2 bg-slate-600 rounded-full mb-2" />
                                        <div className="w-10 h-2 bg-slate-700 rounded-full" />
                                    </motion.div>
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.9 }}
                                        className="bg-slate-800/50 rounded-xl border border-slate-700 p-4"
                                    >
                                        <div className="w-6 h-6 rounded bg-purple-500/20 mb-2 flex items-center justify-center"><BookOpen className="w-3 h-3 text-purple-400" /></div>
                                        <div className="w-20 h-2 bg-slate-600 rounded-full mb-2" />
                                        <div className="w-12 h-2 bg-slate-700 rounded-full" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 4: CORE FEATURES                   */}
                {/* ========================================== */}
                <section className="relative px-6 py-24 mx-auto max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Everything You Need In One Platform</h2>
                        <p className="text-lg text-slate-400">Purpose-built tools for modern education, designed to flow together seamlessly.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Video className="w-6 h-6 text-indigo-400" />, title: "Virtual Classroom", features: ["WebRTC live classes", "Screen sharing", "Emoji reactions"] },
                            { icon: <ClipboardCheck className="w-6 h-6 text-emerald-400" />, title: "Smart Attendance", features: ["Auto-join tracking", "CSV exports", "Absence analytics"] },
                            { icon: <Database className="w-6 h-6 text-blue-400" />, title: "Academic System", features: ["Course structuring", "Semester grouping", "Subject allocation"] },
                            { icon: <BookOpen className="w-6 h-6 text-purple-400" />, title: "Assignments", features: ["Digital submissions", "Automated grading", "Performance tracking"] }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                                <ul className="space-y-3">
                                    {feature.features.map((item, i) => (
                                        <li key={i} className="flex items-center text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 5: PLATFORM ROLES                  */}
                {/* ========================================== */}
                <section id="roles" className="relative px-6 py-24 mx-auto max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Built For Everyone In Education</h2>
                        <p className="text-lg text-slate-400">Dedicated portals providing exactly what each user needs, and nothing they don't.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { role: "ADMIN SERVER", title: "Control the Institution", color: "from-blue-600/20 to-indigo-600/20", borderColor: "hover:border-blue-500/50", icon: <ShieldCheck className="w-8 h-8 text-blue-400" />, items: ["Manage users & roles", "Course structures", "Data analytics"] },
                            { role: "TEACHER PORTAL", title: "Focus on Teaching", color: "from-purple-600/20 to-pink-600/20", borderColor: "hover:border-purple-500/50", icon: <Users className="w-8 h-8 text-purple-400" />, items: ["Conduct live classes", "Upload materials", "Grade assignments"] },
                            { role: "STUDENT HUB", title: "Learn Without Friction", color: "from-emerald-600/20 to-teal-600/20", borderColor: "hover:border-emerald-500/50", icon: <GraduationCap className="w-8 h-8 text-emerald-400" />, items: ["One-click class join", "Submit assignments", "Track personal growth"] }
                        ].map((role, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                className={`relative bg-slate-900 overflow-hidden rounded-3xl border border-slate-800 p-8 ${role.borderColor} transition-colors duration-500 group cursor-default`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="relative z-10">
                                    <div className="text-xs font-bold tracking-widest text-slate-500 mb-2">{role.role}</div>
                                    <h3 className="text-2xl font-bold text-white mb-6">{role.title}</h3>
                                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                                        {role.icon}
                                    </div>
                                    <ul className="space-y-4">
                                        {role.items.map((item, i) => (
                                            <li key={i} className="flex items-center text-slate-300">
                                                <ArrowRight className="w-4 h-4 mr-3 text-slate-500 group-hover:text-white transition-colors" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 6: TIME SAVING STATS               */}
                {/* ========================================== */}
                <section className="relative px-6 py-24 mx-auto max-w-7xl">
                    <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-slate-800 rounded-3xl p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700/50">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-4">
                                <div className="text-5xl md:text-6xl font-extrabold text-white mb-4">90<span className="text-indigo-400">%</span></div>
                                <p className="text-lg font-medium text-slate-300">Less manual attendance work</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="p-4">
                                <div className="text-5xl md:text-6xl font-extrabold text-white mb-4">3<span className="text-purple-400">x</span></div>
                                <p className="text-lg font-medium text-slate-300">Faster assignment evaluation</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="p-4">
                                <div className="text-5xl md:text-6xl font-extrabold text-white mb-4">100<span className="text-emerald-400">%</span></div>
                                <p className="text-lg font-medium text-slate-300">Centralized academic system</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 7: PLATFORM PREVIEW                */}
                {/* ========================================== */}
                <section className="relative px-6 py-24 mx-auto max-w-7xl overflow-hidden">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">See Learnify In Action</h2>
                        <p className="text-lg text-slate-400">Discover how intuitive and powerful the dashboards are for every user.</p>
                    </div>

                    <div className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[600px] bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden group">
                        {/* Fake Browser Chrome */}
                        <div className="absolute top-0 w-full h-12 bg-slate-800/80 border-b border-slate-700/50 flex items-center px-4 space-x-2 z-20">
                            <div className="w-3 h-3 rounded-full bg-slate-600" />
                            <div className="w-3 h-3 rounded-full bg-slate-600" />
                            <div className="w-3 h-3 rounded-full bg-slate-600" />
                            <div className="ml-4 px-4 py-1.5 bg-slate-900 rounded-md text-xs text-slate-500 font-mono tracking-widest border border-slate-700">learnify.university.edu/admin/dashboard</div>
                        </div>

                        {/* Scrolling Content Fake */}
                        <motion.div
                            className="absolute top-12 left-0 w-full h-[800px] p-6 grid grid-cols-4 gap-6 hover:translate-y-[-200px] transition-transform duration-[10s] ease-linear"
                        >
                            {/* Fake Sidebar */}
                            <div className="col-span-1 border-r border-slate-800 pr-6 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-10 bg-slate-800/50 rounded-lg" />)}
                            </div>
                            {/* Fake Main Content */}
                            <div className="col-span-3 space-y-6">
                                <div className="flex space-x-6 h-32">
                                    <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                                        <div className="w-8 h-8 rounded bg-blue-500/20 mb-4" />
                                        <div className="w-24 h-4 bg-slate-600 rounded mb-2" />
                                        <div className="w-16 h-8 bg-slate-500 rounded" />
                                    </div>
                                    <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                                        <div className="w-8 h-8 rounded bg-emerald-500/20 mb-4" />
                                        <div className="w-24 h-4 bg-slate-600 rounded mb-2" />
                                        <div className="w-16 h-8 bg-slate-500 rounded" />
                                    </div>
                                    <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                                        <div className="w-8 h-8 rounded bg-purple-500/20 mb-4" />
                                        <div className="w-24 h-4 bg-slate-600 rounded mb-2" />
                                        <div className="w-16 h-8 bg-slate-500 rounded" />
                                    </div>
                                </div>
                                <div className="w-full h-64 bg-slate-800/30 rounded-xl border border-slate-700" />
                                <div className="w-full h-40 bg-slate-800/30 rounded-xl border border-slate-700" />
                            </div>
                        </motion.div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none z-10" />
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 8: TRUST / INSTITUTION             */}
                {/* ========================================== */}
                <section className="relative px-6 py-16 border-y border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto text-center">
                        <p className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-8">Designed for advanced universities and global schools</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-slate-700 rounded-full" />
                                    <div className="w-24 h-4 bg-slate-700 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========================================== */}
                {/* SECTION 9: FINAL CTA                       */}
                {/* ========================================== */}
                <section className="relative px-6 py-32 mx-auto max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-[3rem] p-12 md:p-20 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none" />

                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight relative z-10">The Future of Education<br />Starts Here</h2>
                        <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto relative z-10">Join thousands of educators and students experiencing a streamlined, focused, and powerful learning platform.</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 text-base font-medium text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center group">
                                Start Using Learnify Now
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 text-base font-medium text-indigo-100 transition-all bg-slate-800/50 border border-indigo-500/30 rounded-full hover:bg-slate-800 hover:text-white backdrop-blur-md flex items-center justify-center">
                                Request Demo
                            </Link>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* ========================================== */}
            {/* SECTION 10: FOOTER                         */}
            {/* ========================================== */}
            <footer className="relative bg-slate-950 border-t border-slate-800 pt-20 pb-10 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <GraduationCap className="text-white w-5 h-5" />
                                </div>
                                <span className="font-bold text-xl text-white">Learnify</span>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">The modern operating system for education. Effortless classroom management, live learning, and academic tracking.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Platform</h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><a href="#features" className="hover:text-white transition-colors">Virtual Classroom</a></li>
                                <li><a href="#features" className="hover:text-white transition-colors">Smart Attendance</a></li>
                                <li><a href="#features" className="hover:text-white transition-colors">Academic Management</a></li>
                                <li><a href="#features" className="hover:text-white transition-colors">Assessment Engine</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Roles</h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><a href="#roles" className="hover:text-white transition-colors">Institution Admins</a></li>
                                <li><a href="#roles" className="hover:text-white transition-colors">Teachers & Professors</a></li>
                                <li><a href="#roles" className="hover:text-white transition-colors">Students</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><a href="#how-it-works" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="https://github.com/Amitprajapati111/Learnify#readme" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="https://github.com/Amitprajapati111/Learnify" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                                <li><a href="mailto:amitofficialcs@gmail.com" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-slate-500 mb-4 md:mb-0">© {new Date().getFullYear()} Learnify Platform. All rights reserved.</p>
                        <div className="flex space-x-6 text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Security</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
