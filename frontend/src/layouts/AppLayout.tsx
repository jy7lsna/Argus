import React, { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    ShieldAlert,
    Search,
    Loader2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { analysisService } from '../services/analysisService';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 glass h-screen fixed left-0 top-0 z-50 flex flex-col p-6">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <ShieldAlert className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">Argus</span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
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
    );
};

const Navbar = () => {
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
        <header className="h-16 glass sticky top-0 z-40 ml-64 border-l-0 border-t-0 flex items-center justify-between px-8">
            <form onSubmit={handleAnalyze} className="flex items-center gap-4 bg-surface/50 px-4 py-2 rounded-lg border border-border w-96 relative">
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

            <div className="flex items-center gap-4">
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
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <Navbar />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
};
