import { ShieldAlert, Target, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Badge = ({ children }: { children: React.ReactNode }) => (
    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-8 backdrop-blur-md text-primary">
        {children}
    </div>
);

const About = () => {
    return (
        <div className="bg-background text-white min-h-screen selection:bg-primary/30">
            <div className="fixed inset-0 grid-background pointer-events-none opacity-10" />

            {/* Simple Nav */}
            <nav className="h-20 px-8 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform">
                        <ShieldAlert size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter uppercase font-display">Argus</span>
                </Link>
                <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-all">Sign In</Link>
            </nav>

            <div className="max-w-5xl mx-auto px-8 py-32 relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

                <Badge>The Sentinel Directive</Badge>
                <h1 className="mb-12 animate-in tracking-tight">
                    Defending your <br />
                    <span className="text-gradient">digital frontiers.</span>
                </h1>

                <div className="grid md:grid-cols-2 gap-20 mt-20">
                    <div className="space-y-8 animate-in" style={{ animationDelay: '0.1s' }}>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Argus was founded on a simple principle: security must be automatic. In an era of infinite scaling infrastructure, manual monitoring is no longer sufficient.
                        </p>
                        <p className="text-text-secondary leading-relaxed text-sm">
                            Our mission is to democratize high-fidelity offensive intelligence. We empower every organization to see their environment through the eyes of an adversary, revealing gaps before they can be exploited.
                        </p>
                        <div className="pt-8">
                            <Link to="/register" className="bg-primary hover:bg-primary-hover px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 w-fit transition-all shadow-xl shadow-primary/20">
                                Join the Mission <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 animate-in" style={{ animationDelay: '0.2s' }}>
                        <div className="glass p-10 rounded-[40px] border-primary/20">
                            <Target className="text-primary mb-6" size={28} />
                            <h3 className="mb-3">Our Core Mandate</h3>
                            <p className="text-text-secondary text-base leading-relaxed">To provide continuous, autonomous risk monitoring that evolves alongside the complex modern footprint.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="glass p-10 rounded-[32px]">
                                <Activity className="text-accent mb-4" size={24} />
                                <h4 className="font-bold mb-1 text-sm">Real-time</h4>
                                <p className="text-[10px] text-text-muted">Continuous observation.</p>
                            </div>
                            <div className="glass p-10 rounded-[32px]">
                                <ShieldCheck className="text-secondary mb-4" size={24} />
                                <h4 className="font-bold mb-1 text-sm">Validated</h4>
                                <p className="text-[10px] text-text-muted">Zero noise protocol.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="py-20 px-8 text-center text-text-muted border-t border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-[0.4em]">© 2026 Argus Security Protocol</div>
            </footer>
        </div>
    );
};

export default About;
