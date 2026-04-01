import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShieldAlert, ShieldCheck, Check,
    Cpu, Radar, Sparkles, Globe, ArrowRight,
    Lock, Layers, Plus,
    Eye, Activity, Fingerprint, Scan, Wifi, Server,
    Database, Bug, Zap
} from 'lucide-react';

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
   ───────────────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.8, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] as const }
    })
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.25, 0.4, 0.25, 1] as const } }
};

/* ─────────────────────────────────────────────
   3D TILT CARD COMPONENT
   ───────────────────────────────────────────── */
const TiltCard = ({ children, className = '', intensity = 10 }: { children: React.ReactNode; className?: string; intensity?: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 200, damping: 30 });
    const springY = useSpring(rotateY, { stiffness: 200, damping: 30 });

    const handleMouse = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        rotateX.set(-y * intensity);
        rotateY.set(x * intensity);
    }, [intensity, rotateX, rotateY]);

    const handleLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            style={{ rotateX: springX, rotateY: springY, transformPerspective: 800 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};


/* ─────────────────────────────────────────────
   SECTION BADGE
   ───────────────────────────────────────────── */
const Badge = ({ children }: { children: React.ReactNode }) => (
    <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] text-primary inline-flex items-center gap-2.5 mb-8 bg-primary/[0.06] border border-primary/15 backdrop-blur-md"
    >
        <Sparkles size={12} className="opacity-70" />
        {children}
    </motion.span>
);

/* ─────────────────────────────────────────────
   FAQ ITEM
   ───────────────────────────────────────────── */
const FAQItem = ({ q, a }: { q: string; a: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl cursor-pointer group hover:border-white/12 transition-all duration-300"
            onClick={() => setOpen(!open)}
        >
            <div className="flex items-center justify-between p-6">
                <span className="font-semibold text-[15px] text-white/80 group-hover:text-white transition-colors">{q}</span>
                <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    <Plus size={16} className={open ? 'text-primary' : 'text-white/30'} />
                </motion.div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 text-sm text-white/40 leading-relaxed border-t border-white/5 pt-4">
                            {a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   SECTION HEADING (reusable)
   ───────────────────────────────────────────── */
const SectionHeading = ({ badge, title, subtitle }: { badge: string; title: React.ReactNode; subtitle: string }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="text-center mb-20"
    >
        <motion.div variants={fadeUp}><Badge>{badge}</Badge></motion.div>
        <motion.h2 variants={fadeUp} className="font-display font-semibold text-3xl md:text-5xl tracking-[-0.02em] mb-6 text-gradient">{title}</motion.h2>
        <motion.p variants={fadeUp} className="text-base text-white/35 max-w-2xl mx-auto leading-relaxed">{subtitle}</motion.p>
    </motion.div>
);

/* ─────────────────────────────────────────────
   FLOATING HERO ELEMENTS (Cybersecurity themed)
   ───────────────────────────────────────────── */
const FloatingElement = ({ children, className, delay = 0, duration = 5, x = 0, y = 10 }: { children: React.ReactNode; className: string; delay?: number; duration?: number; x?: number; y?: number }) => (
    <motion.div
        className={`absolute pointer-events-none ${className}`}
        animate={{
            y: [0, -y, 0],
            x: [0, x, 0],
            rotate: [0, 3, -3, 0],
        }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
        {children}
    </motion.div>
);

const HeroFloatingElements = () => (
    <>
        {/* Top-left: Shield */}
        <FloatingElement className="top-[10%] left-[12%] hidden lg:block" delay={0} duration={6} y={15}>
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border-primary/15 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                <ShieldCheck size={28} className="text-primary/60" />
            </div>
        </FloatingElement>

        {/* Top-right: Lock */}
        <FloatingElement className="top-[10%] right-[12%] hidden lg:block" delay={1} duration={7} y={12} x={5}>
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-white/8 shadow-[0_0_20px_rgba(192,132,252,0.12)]">
                <Lock size={24} className="text-accent/50" />
            </div>
        </FloatingElement>

        {/* Left-upper: Activity (Mirrors Zap) */}
        <FloatingElement className="top-[22%] left-[8%] hidden xl:block" delay={1.2} duration={6.5} y={12} x={4}>
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-secondary/12 shadow-[0_0_16px_rgba(99,102,241,0.08)]">
                <Activity size={22} className="text-secondary/40" />
            </div>
        </FloatingElement>

        {/* Left mid: Fingerprint */}
        <FloatingElement className="top-[38%] left-[10%] hidden xl:block" delay={2} duration={8} y={18}>
            <div className="w-18 h-18 glass rounded-2xl flex items-center justify-center border-secondary/12 shadow-[0_0_24px_rgba(99,102,241,0.15)]">
                <Fingerprint size={32} className="text-secondary/45" />
            </div>
        </FloatingElement>

        {/* Right mid: Scan */}
        <FloatingElement className="top-[38%] right-[10%] hidden xl:block" delay={0.5} duration={6} y={10} x={-6}>
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-white/8 shadow-[0_0_16px_rgba(139,92,246,0.1)]">
                <Scan size={24} className="text-primary/45" />
            </div>
        </FloatingElement>

        {/* Bottom-left: Wifi */}
        <FloatingElement className="bottom-[24%] left-[12%] hidden lg:block" delay={1.5} duration={7} y={14}>
            <div className="w-14 h-14 glass rounded-xl flex items-center justify-center border-accent/12 shadow-[0_0_18px_rgba(192,132,252,0.1)]">
                <Wifi size={22} className="text-accent/45" />
            </div>
        </FloatingElement>

        {/* Bottom-right: Server */}
        <FloatingElement className="bottom-[24%] right-[12%] hidden lg:block" delay={3} duration={6.5} y={12} x={4}>
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border-secondary/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <Server size={26} className="text-secondary/45" />
            </div>
        </FloatingElement>

        {/* Top-center-left: Database */}
        <FloatingElement className="top-[16%] left-[26%] hidden xl:block" delay={0.8} duration={7.5} y={10} x={3}>
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-primary/12 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <Database size={22} className="text-primary/50" />
            </div>
        </FloatingElement>

        {/* Top-center-right: Bug */}
        <FloatingElement className="top-[16%] right-[26%] hidden xl:block" delay={2.5} duration={8} y={14}>
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-accent/10 shadow-[0_0_18px_rgba(192,132,252,0.1)]">
                <Bug size={22} className="text-accent/40" />
            </div>
        </FloatingElement>


        {/* Right-upper: Zap */}
        <FloatingElement className="top-[22%] right-[8%] hidden xl:block" delay={1.8} duration={5.5} y={16} x={-4}>
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-primary/12 shadow-[0_0_20px_rgba(139,92,246,0.12)]">
                <Zap size={22} className="text-primary/55" />
            </div>
        </FloatingElement>


        {/* Scattered small dots/particles */}
        {[
            { top: '18%', left: '20%', size: 3, color: 'primary', delay: 0 },
            { top: '25%', right: '22%', size: 2, color: 'accent', delay: 1 },
            { top: '50%', left: '15%', size: 4, color: 'secondary', delay: 2 },
            { top: '60%', right: '18%', size: 2, color: 'primary', delay: 0.5 },
            { top: '45%', left: '25%', size: 3, color: 'accent', delay: 1.5 },
            { top: '8%', left: '40%', size: 2, color: 'secondary', delay: 0.8 },
            { top: '32%', right: '15%', size: 3, color: 'primary', delay: 2.2 },
            { top: '70%', left: '30%', size: 2, color: 'accent', delay: 1.8 },
            { top: '55%', right: '25%', size: 3, color: 'secondary', delay: 0.3 },
        ].map((dot, i) => (
            <motion.div
                key={i}
                className={`absolute hidden lg:block rounded-full bg-${dot.color}/30`}
                style={{ top: dot.top, left: dot.left, right: (dot as any).right, width: dot.size, height: dot.size }}
                animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: dot.delay }}
            />
        ))}

        {/* Aurora / flowing gradient overlays at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[600px] pointer-events-none overflow-hidden">
            <div
                className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full opacity-[0.12]"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.3) 40%, transparent 70%)',
                    animation: 'aurora-shift 12s ease-in-out infinite',
                }}
            />
            <div
                className="absolute top-[-10%] right-[5%] w-[600px] h-[400px] rounded-full opacity-[0.08]"
                style={{
                    background: 'radial-gradient(circle, rgba(192,132,252,0.5) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)',
                    animation: 'aurora-shift 15s ease-in-out infinite 3s',
                }}
            />
            <div
                className="absolute top-[10%] left-[30%] w-[400px] h-[300px] rounded-full opacity-[0.06]"
                style={{
                    background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.2) 35%, transparent 70%)',
                    animation: 'aurora-shift 10s ease-in-out infinite 6s',
                }}
            />
        </div>
    </>
);

/* ═══════════════════════════════════════════════
   HOME COMPONENT
   ═══════════════════════════════════════════════ */
const Home = () => {
    const [scrolled, setScrolled] = useState(false);
    const [domain, setDomain] = useState('');
    const navigate = useNavigate();
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleAnalyze = (event: React.FormEvent) => {
        event.preventDefault();
        if (!domain.trim()) return;
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        localStorage.setItem('pending_domain', cleanDomain);
        const token = localStorage.getItem('auth_token');
        navigate(token ? '/dashboard' : '/login');
    };

    const features = [
        { icon: Radar, title: 'Asset Discovery', desc: 'Automatically map every subdomain, IP, and exposed service across your organization.', color: 'primary' },
        { icon: Layers, title: 'Tech Stack Detection', desc: 'Identify frameworks, servers, and third-party services powering your infrastructure.', color: 'secondary' },
        { icon: Eye, title: 'Vulnerability Scanning', desc: 'Continuous scanning for misconfigurations, open ports, and known CVEs.', color: 'accent' },
        { icon: Activity, title: 'Real-time Monitoring', desc: 'Live dashboards with instant alerts when new assets appear or configs change.', color: 'primary' },
        { icon: Lock, title: 'SSL/TLS Audit', desc: 'Certificate health checks, expiry warnings, and protocol compliance verification.', color: 'secondary' },
        { icon: Cpu, title: 'AI Threat Analysis', desc: 'Machine learning models that prioritize risks based on exploitability and impact.', color: 'accent' },
    ];

    return (
        <div className="min-h-screen bg-[#050507] text-white selection:bg-primary/30 relative overflow-hidden">
            {/* Background Layer */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 grid-background opacity-30" />
                <div className="absolute inset-0 stars-background" />
                <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] opacity-15">
                    <div className="orbit-arc animate-orbit" />
                    <div className="orbit-arc animate-orbit [animation-delay:-20s] scale-75 rotate-45" />
                    <div className="orbit-arc animate-orbit [animation-delay:-40s] scale-50 -rotate-12" />
                </div>
            </div>

            {/* ─── Navbar ─── */}
            <motion.nav
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            >
                <div
                    className="px-4 py-2 rounded-full border transition-all duration-500"
                    style={{
                        display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '4px',
                        background: scrolled ? 'rgba(5,5,7,0.85)' : 'rgba(255,255,255,0.02)',
                        backdropFilter: `blur(${scrolled ? 24 : 16}px)`,
                        borderColor: scrolled ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.06)',
                        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)' : '0 12px 32px rgba(0,0,0,0.4)',
                    }}
                >
                    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center shrink-0 mr-1">
                        <ShieldAlert size={12} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-xs tracking-tight mr-3 shrink-0 border-r border-white/8 pr-4">ARGUS</span>
                    {['About', 'Features', 'Impact', 'Pricing', 'FAQ'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-[12px] font-medium text-white/40 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-all duration-200 shrink-0"
                        >
                            {item}
                        </a>
                    ))}
                    <Link
                        to="/login"
                        className="ml-2 btn-primary text-[12px] px-5 py-1.5 rounded-full"
                    >
                        Try Argus
                    </Link>
                </div>
            </motion.nav>

            <main id="main-content">
                {/* ─── Hero Section ─── */}
                <section ref={heroRef} className="relative pt-36 pb-20 px-6 flex flex-col items-center text-center z-10">
                {/* Hero grid background */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(139, 92, 246, 0.08) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 60px',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050507]/60 to-[#050507]" />
                </div>
                {/* Floating cybersecurity elements */}
                <HeroFloatingElements />

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center relative z-10">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
                        className="mb-5 flex justify-center"
                    >
                        <Badge>AI-Powered Security Platform</Badge>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        className="mb-5 max-w-5xl font-display text-5xl md:text-7xl lg:text-[88px] tracking-[-0.03em] leading-[1.08] text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                        style={{ textShadow: '0 4px 40px rgba(139,92,246,0.15)' }}
                    >
                        <span className="font-medium text-gradient">Defending your</span>
                        <br />
                        <span className="font-bold text-gradient-purple">Digital Sovereignty</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-base md:text-lg text-white/35 max-w-2xl mb-8 mx-auto text-center leading-relaxed"
                    >
                        Empower your organization with Argus's autonomous security suite
                        designed to streamline operations and neutralize sophisticated threats.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.form
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1, ease: [0.25, 0.4, 0.25, 1] }}
                        className="w-full max-w-2xl px-4 mx-auto mt-5"
                        onSubmit={handleAnalyze}
                    >
                        <div className="glass p-1.5 rounded-2xl group focus-within:border-primary/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center gap-1">
                                <div className="flex-grow relative flex items-center">
                                    <Globe size={18} className="text-white/20 ml-6 absolute left-0" />
                                    <input
                                        type="text"
                                        placeholder="Enter your enterprise domain (e.g. google.com)"
                                        value={domain}
                                        onChange={(event) => setDomain(event.target.value)}
                                        className="w-full bg-transparent border-none focus:outline-none py-4 pl-14 text-white placeholder:text-white/20 font-medium text-sm"
                                    />
                                </div>
                                <button type="submit" className="btn-primary py-3.5 px-8 rounded-xl text-sm flex items-center justify-center gap-2 whitespace-nowrap mr-1">
                                    Analyze Domain
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="mt-5 flex items-center justify-center gap-8 text-[11px] font-semibold uppercase tracking-widest text-white/20"
                        >
                            {['Multi-Domain', 'Real-time', 'Enterprise SLA'].map((t, i) => (
                                <motion.span
                                    key={t}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 + i * 0.1 }}
                                    className="flex items-center gap-2"
                                >
                                    <Check size={14} className="text-primary/70" /> {t}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.form>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60, rotateX: 12 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1.2, delay: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
                    className="mt-16 w-full max-w-6xl mx-auto px-4"
                    style={{ perspective: 1200 }}
                >
                    <TiltCard className="relative group cursor-pointer" intensity={5}>
                        <div className="absolute -inset-2 rounded-[32px] bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
                        <div className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/5 transition-all duration-700 z-10 pointer-events-none" />
                        <div className="relative glass rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[1.02]">
                            <img
                                src="/argus_dashboard.png"
                                alt="Argus Dashboard"
                                className="w-full h-auto"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-[1.5s] ease-in-out" />
                        </div>
                    </TiltCard>
                </motion.div>
            </section>

            {/* ─── Features Section ─── */}
            <section id="features" className="relative py-32 px-6 z-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading
                        badge="Core Capabilities"
                        title={<>Full-spectrum <br /><span className="text-white/30">security intelligence</span></>}
                        subtitle="Every tool you need to discover, monitor, and neutralize threats across your entire digital footprint."
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                        {features.map((feature, i) => (
                            <motion.div key={feature.title} variants={fadeUp} custom={i}>
                                <TiltCard
                                    className="glass p-8 rounded-2xl hover:bg-white/[0.03] hover:border-white/12 hover:-translate-y-1 transition-all duration-500 group cursor-pointer h-full"
                                    intensity={6}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-${feature.color}/15 transition-all duration-300`}>
                                        <feature.icon size={24} className={`text-${feature.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3 group-hover:text-white transition-colors">{feature.title}</h3>
                                    <p className="text-sm text-white/30 leading-relaxed group-hover:text-white/50 transition-colors">{feature.desc}</p>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── Impact Section ─── */}
            <section id="impact" className="relative py-32 px-6 z-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading
                        badge="Proven Results"
                        title={<>Impact at <span className="text-white/30">scale</span></>}
                        subtitle="Organizations using Argus see measurable improvements in security posture within weeks."
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
                    >
                        {[
                            { value: '99.9', suffix: '%', label: 'Uptime Guarantee', color: 'primary' },
                            { value: '<2', suffix: 'min', label: 'Avg. Detection Time', color: 'primary' },
                            { value: '50', suffix: 'K+', label: 'Assets Monitored', color: 'primary' },
                            { value: '85', suffix: '%', label: 'Faster Remediation', color: 'primary' },
                        ].map((stat, i) => (
                            <motion.div key={stat.label} variants={fadeUp} custom={i}>
                                <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors h-full flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                    <div className={`absolute inset-0 bg-gradient-to-b from-${stat.color}/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                                        {stat.value}<span className={`text-${stat.color}`}>{stat.suffix}</span>
                                    </div>
                                    <div className="text-sm font-medium text-white/40 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={scaleIn}
                        className="mt-4"
                    >
                        <div className="glass p-8 md:p-12 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                                <div className="lg:col-span-7">
                                    <h3 className="text-3xl font-display font-semibold mb-4 tracking-tight">Continuous Attack Surface Management</h3>
                                    <p className="text-lg text-white/35 leading-relaxed mb-8 max-w-2xl">
                                        Argus doesn't just scan once — it continuously monitors your perimeter. When new subdomains appear, configurations drift, or certificates near expiry, you're the first to know.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {['Auto-discovery', 'Config drift alerts', 'Cert monitoring', 'Port scanning'].map((tag) => (
                                            <span key={tag} className="glass-pill px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white/50 border border-white/5 hover:text-white hover:border-white/15 hover:bg-white/[0.02] transition-all duration-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:col-span-5 flex justify-center lg:justify-end pr-8">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full" />
                                        <div className="absolute w-[140%] h-[140%] border border-white/5 rounded-full animate-orbit" />
                                        <div className="absolute w-[100%] h-[100%] border border-primary/10 rounded-full animate-orbit [animation-direction:reverse]" />
                                        <div className="w-24 h-24 glass rounded-2xl flex items-center justify-center border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative z-10">
                                            <ShieldCheck size={40} className="text-primary/70" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── About Section ─── */}
            <section id="about" className="relative py-32 px-6 z-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
                    >
                        <motion.div variants={fadeUp} className="flex flex-col justify-between h-full">
                            <div>
                                <Badge>The Mission</Badge>
                                <h2 className="font-display font-semibold text-4xl md:text-5xl lg:text-[56px] tracking-[-0.02em] leading-[1.05] mb-6 mt-4">
                                    Autonomous <br /> Threat Neutralization
                                </h2>
                                <p className="text-lg text-white/35 md:max-w-[90%] leading-relaxed mb-10">
                                    Our core mandate is to build an invincible digital perimeter. Argus operates at the intersection of predictive intelligence and rapid response, ensuring your infrastructure remains uncompromisingly secure.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: Radar, title: 'Predictive Discovery', desc: 'Full spectrum asset discovery before adversaries can find them.', color: 'primary' },
                                    { icon: Lock, title: 'Enforced Stealth', desc: 'Deep infrastructure hardening through automated policy enforcement.', color: 'secondary' },
                                ].map((card) => (
                                    <div key={card.title} className="glass p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-br from-${card.color}/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                        <div className={`w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500 group-hover:border-${card.color}/20 group-hover:bg-${card.color}/5`}>
                                            <card.icon size={26} className={`text-white/50 group-hover:text-${card.color} transition-colors duration-500`} />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 tracking-tight relative z-10">{card.title}</h3>
                                        <p className="text-sm text-white/35 leading-relaxed relative z-10 group-hover:text-white/50 transition-colors duration-500">{card.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp} custom={2} className="relative h-full min-h-[500px] lg:min-h-[600px] glass rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-white/10 transition-colors duration-700 flex flex-col justify-end p-10 lg:p-14">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

                            {/* Graphic background */}
                            <div className="absolute top-[-15%] right-[-15%] w-[80%] aspect-square max-w-[500px] flex items-center justify-center pointer-events-none" style={{ perspective: 1000 }}>

                                {/* 3D orbital rings */}
                                <div className="absolute w-[90%] h-[90%] rounded-full border border-white/5" style={{ transform: 'rotateX(70deg)' }}>
                                    <div className="absolute inset-0 rounded-full animate-orbit">
                                        <div className="absolute top-0 left-1/2 w-2.5 h-2.5 bg-primary/80 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.8)] -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                                <div className="absolute w-[70%] h-[70%] rounded-full border border-primary/10" style={{ transform: 'rotateX(65deg) rotateZ(45deg)' }}>
                                    <div className="absolute inset-0 rounded-full animate-orbit [animation-direction:reverse] [animation-duration:30s]">
                                        <div className="absolute top-0 left-1/2 w-2 h-2 bg-accent/80 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.8)] -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                                <div className="absolute w-[50%] h-[50%] rounded-full border border-secondary/10" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }}>
                                    <div className="absolute inset-0 rounded-full animate-orbit [animation-duration:20s]">
                                        <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-secondary/80 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)] -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                </div>

                                {/* Center glow and icon */}
                                <div className="absolute w-64 h-64 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-colors duration-700 delay-100" />

                                <div className="relative z-20 w-24 h-24 rounded-3xl glass backdrop-blur-md border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.2)] group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <ShieldCheck size={40} className="text-white/80 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
                                </div>
                            </div>

                            {/* Card Content inside the large block */}
                            <div className="relative z-30 max-w-md mt-auto">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-white/60 mb-6 backdrop-blur-md">
                                    <Globe size={14} className="text-primary" /> Global Intelligence
                                </div>
                                <h3 className="text-3xl font-display font-semibold mb-4 tracking-tight">Unprecedented Context</h3>
                                <p className="text-white/40 leading-relaxed text-lg">
                                    Our scanning engines aggregate data from thousands of global vantage points to differentiate between noise, benign activity, and imminent attacks. Argus understands the blast radius of vulnerabilities before they are weaponized.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Pricing Section ─── */}
            <section id="pricing" className="relative py-32 px-6 z-10 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <SectionHeading
                        badge="Pricing"
                        title={<>Plans for every <span className="text-white/30">scale</span></>}
                        subtitle="Start free. Scale when you're ready. No hidden fees."
                    />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    >
                        {/* Starter */}
                        <motion.div variants={fadeUp}>
                            <TiltCard className="glass p-8 rounded-2xl flex flex-col h-full hover:border-white/10 transition-all duration-500" intensity={5}>
                                <h3 className="text-lg font-semibold mb-2">Starter</h3>
                                <p className="text-sm text-white/30 mb-6">Perfect for side projects and personal use.</p>
                                <div className="text-4xl font-display font-bold mb-1">$0</div>
                                <span className="text-xs text-white/35 mb-8">forever free</span>
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {['1 domain', '100 assets', 'Weekly scans', 'Community support'].map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-white/45">
                                            <Check size={14} className="text-primary/70 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register" className="btn-outline w-full text-center py-3 text-sm">
                                    Get Started
                                </Link>
                            </TiltCard>
                        </motion.div>

                        {/* Pro — highlighted */}
                        <motion.div variants={fadeUp} custom={1}>
                            <TiltCard className="relative glass p-8 rounded-2xl border-primary/20 bg-primary/[0.03] flex flex-col h-full ring-1 ring-primary/15 hover:ring-primary/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.12)] transition-all duration-500" intensity={5}>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-primary/25">
                                    Most Popular
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Pro</h3>
                                <p className="text-sm text-white/30 mb-6">For growing teams that need more power.</p>
                                <div className="text-4xl font-display font-bold mb-1">$49</div>
                                <span className="text-xs text-white/25 mb-8">per month</span>
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {['10 domains', 'Unlimited assets', 'Daily scans', 'Priority support', 'API access', 'Custom reports'].map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-white/45">
                                            <Check size={14} className="text-primary/70 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register" className="btn-primary w-full text-center py-3 text-sm">
                                    Start Free Trial
                                </Link>
                            </TiltCard>
                        </motion.div>

                        {/* Enterprise */}
                        <motion.div variants={fadeUp} custom={2}>
                            <TiltCard className="glass p-8 rounded-2xl flex flex-col h-full hover:border-white/10 transition-all duration-500" intensity={5}>
                                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                                <p className="text-sm text-white/30 mb-6">For organizations with advanced needs.</p>
                                <div className="text-4xl font-display font-bold mb-1">Custom</div>
                                <span className="text-xs text-white/25 mb-8">contact sales</span>
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {['Unlimited domains', 'Continuous scanning', 'Dedicated CSM', 'SLA guarantee', 'SSO & RBAC', 'On-prem option'].map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-white/45">
                                            <Check size={14} className="text-primary/70 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register" className="btn-outline w-full text-center py-3 text-sm">
                                    Contact Sales
                                </Link>
                            </TiltCard>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── FAQ Section ─── */}
            <section id="faq" className="relative py-32 px-6 z-10 border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <SectionHeading
                        badge="FAQ"
                        title="Common questions"
                        subtitle="Everything you need to know about Argus and how it works."
                    />
                    <div className="space-y-3">
                        <FAQItem q="What does Argus scan for?" a="Argus performs comprehensive attack surface mapping including subdomain enumeration, open port detection, technology fingerprinting, SSL/TLS certificate auditing, and known vulnerability (CVE) matching." />
                        <FAQItem q="How is Argus different from traditional scanners?" a="Traditional scanners give you a point-in-time snapshot. Argus provides continuous monitoring with AI-driven risk prioritization, delta analysis between scans, and real-time alerts — so you know about new exposures the moment they appear, not days later." />
                        <FAQItem q="How often are scans performed?" a="Scan frequency depends on your plan. Starter plans include weekly scans, Pro plans include daily scans, and Enterprise customers can configure continuous real-time monitoring." />
                        <FAQItem q="Is my data secure?" a="Absolutely. All scan data is encrypted at rest and in transit. We follow SOC 2 Type II compliance standards and never share your data with third parties." />
                        <FAQItem q="Can I integrate Argus with my existing tools?" a="Yes. Pro and Enterprise plans include full API access, webhooks, and pre-built integrations with popular SIEM solutions, Slack, Jira, and more." />
                        <FAQItem q="What happens when a vulnerability is found?" a="You'll receive instant notifications via your configured channels (email, Slack, webhook). Each finding includes severity, context, and recommended remediation steps." />
                    </div>
                </div>
            </section>

            {/* ─── CTA Section ─── */}
            <section className="relative py-32 px-6 z-10 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 text-gradient">
                            Ready to secure your perimeter?
                        </h2>
                        <p className="text-lg text-white/35 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Join organizations that trust Argus to protect their digital assets. Start scanning in under 60 seconds.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn-primary px-10 py-4 text-base rounded-xl inline-flex items-center gap-2 justify-center">
                                Start Free <ArrowRight size={18} />
                            </Link>
                            <a href="#pricing" className="btn-outline px-10 py-4 text-base rounded-xl inline-flex items-center gap-2 justify-center">
                                View Pricing
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            </main>

            {/* ─── Footer ─── */}
            <footer className="relative py-16 px-6 z-10 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                                    <ShieldAlert size={18} className="text-primary" />
                                </div>
                                <span className="font-display font-bold text-xl tracking-tight text-white">ARGUS</span>
                            </div>
                            <p className="text-sm text-white/30 max-w-sm leading-relaxed">
                                AI-powered cybersecurity platform that continuously discovers, monitors, and neutralizes threats across your digital footprint.
                            </p>
                        </div>
                        <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Platform</h4>
                        <ul className="space-y-3">
                            {['Features', 'Pricing', 'API Docs', 'Changelog'].map(link => (
                                <li key={link}><a href={`#${link.toLowerCase()}`} className="text-sm text-white/30 hover:text-white transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Company</h4>
                        <ul className="space-y-3">
                            {['About', 'Blog', 'Careers', 'Contact'].map(link => (
                                <li key={link}><a href={`#${link.toLowerCase()}`} className="text-sm text-white/30 hover:text-white transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/25">© 2025 Argus Systems Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        {['Privacy Policy', 'Terms of Service', 'Security'].map(link => (
                            <a key={link} href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">{link}</a>
                        ))}
                    </div>
                </div>
            </div>
            </footer>
        </div>
    );
};

export default Home;
