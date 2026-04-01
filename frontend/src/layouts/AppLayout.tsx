import React, { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    ShieldAlert,
    Search,
    Loader2,
    X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { analysisService } from '../services/analysisService';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={onClose}
                />
            )}
            <aside
                className={`w-64 glass h-screen fixed left-0 top-0 z-50 flex flex-col p-6 transition-transform duration-300 md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <ShieldAlert className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">Argus</span>
            </div>
                    <button
                        onClick={onClose}
                        className="md:hidden text-white/60 hover:text-white transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === item.path
                            ? 'bg-primary/20 text-primary border border-primary/20'
                            : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-risk-critical transition-colors mt-auto"
            >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
            </button>
            </aside>
        </>
    );
};

const Navbar = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
    const { user } = useAuth();
    const [domain, setDomain] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim()) return;

        setIsAnalyzing(true);
        setAnalyzeError(null);
        try {
            const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
            await analysisService.triggerAnalysis(cleanDomain);
            await queryClient.invalidateQueries({ queryKey: ['analyses'] });
            setDomain('');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Failed to analyze domain:', error);
            setAnalyzeError(error.response?.data?.error || error.message || 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <header className="glass sticky top-0 z-40 ml-0 md:ml-64 border-l-0 border-t-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 md:px-8 md:py-0">
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenMenu}
                    className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    aria-label="Open menu"
                >
                    <LayoutDashboard size={18} />
                </button>
                <span className="md:hidden text-sm font-bold tracking-tight text-white/80">Menu</span>
            </div>
            <form onSubmit={handleAnalyze} className="flex items-center gap-4 bg-surface/50 px-4 py-2 rounded-lg border border-border w-full md:w-96 relative">
                {isAnalyzing ? (
                    <Loader2 size={18} className="text-primary animate-spin" />
                ) : (
                    <Search size={18} className="text-text-secondary" />
                )}
                <input
                    type="text"
                    value={domain}
                    onChange={(e) => { setDomain(e.target.value); setAnalyzeError(null); }}
                    placeholder="Enter domain to analyze (e.g. example.com)"
                    className="bg-transparent border-none outline-none text-sm w-full text-white"
                    disabled={isAnalyzing}
                />
                {analyzeError && (
                    <span className="absolute -bottom-6 left-0 text-risk-critical text-[10px] font-bold">{analyzeError}</span>
                )}
                <button type="submit" className="hidden">Submit</button>
            </form>

            <div className="flex items-center gap-4 justify-between md:justify-end">
                <div className="text-right">
                    <div className="text-sm font-semibold text-white">{user?.name || 'Loading...'}</div>
                    <div className="text-xs text-text-secondary uppercase">{user?.organization?.name || 'Organization'}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-primary font-bold">
                    {initials}
                </div>
            </div>
        </header>
    );
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Navbar onOpenMenu={() => setIsSidebarOpen(true)} />
            <main className="ml-0 md:ml-64 p-4 md:p-8">
                {children}
            </main>
        </div>
    );
};
