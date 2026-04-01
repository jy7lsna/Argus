import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShieldAlert,
    Activity,
    Box,
    AlertCircle,
    Clock,
    Globe,
    Loader2,
    X
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { analysisService } from '../services/analysisService';

const StateCard = ({ title, value, subValue, icon: Icon, colorClass, to }: any) => {
    const CardContent = (
        <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-white/15 hover:bg-white/[0.04] transition-all duration-500 h-full cursor-pointer">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-16 -mt-16 ${colorClass}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass.replace('bg-', 'bg-opacity-20 text-')}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-text-secondary text-sm font-medium mb-1 group-hover:text-white/70 transition-colors">{title}</h3>
                <div className="text-3xl font-bold group-hover:scale-[1.02] origin-left transition-transform">{value}</div>
                <p className="text-xs text-text-secondary mt-1">{subValue}</p>
            </div>
        </div>
    );

    return to ? <Link to={to} className="block">{CardContent}</Link> : CardContent;
};

const Dashboard = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [showAnalyzeInput, setShowAnalyzeInput] = useState(false);
    const [domain, setDomain] = useState('');
    const [errorBanner, setErrorBanner] = useState<string | null>(null);

    const { data: analyses, isLoading } = useQuery({
        queryKey: ['analyses'],
        queryFn: analysisService.getAnalyses,
    });

    // WebSocket Integration for Real-Time UI Updates
    useEffect(() => {
        if (!user?.id) return;

        const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001');

        socket.on(`scan:started:${user.id}`, (data) => {
            console.log('Live Alert: Scan started for', data.domain);
        });

        socket.on(`scan:completed:${user.id}`, (data) => {
            console.log('Live Alert: Scan completed for', data.domain, 'Risk score:', data.riskScore);
            // Invalidate the cache. React Query will auto-refetch and seamlessly update the UI!
            queryClient.invalidateQueries({ queryKey: ['analyses'] });
        });

        socket.on(`scan:failed:${user.id}`, (data) => {
            console.error('Live Alert: Scan failed for', data.domain, 'error:', data.error);
            setErrorBanner(`Background scan failed for ${data.domain}.`);
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.id, queryClient]);

    const mutation = useMutation({
        mutationFn: (domain: string) => analysisService.triggerAnalysis(domain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analyses'] });
            setShowAnalyzeInput(false);
            setDomain('');
            setErrorBanner(null);
        },
        onError: (error: any) => {
            const msg = error.response?.data?.error || error.message || 'Analysis failed. Please try again.';
            setErrorBanner(msg);
        }
    });

    const handleNewAnalysis = (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim()) return;
        setErrorBanner(null);
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        mutation.mutate(cleanDomain);
    };

    const latestAnalysis = analyses?.[0];

    const chartData = latestAnalysis?.risk_histories?.map(h => ({
        name: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: h.score
    })) || [
            { name: 'Jan', score: 45 },
            { name: 'Feb', score: 52 },
            { name: 'Mar', score: 61 },
            { name: 'Apr', score: 58 },
            { name: 'May', score: 63 }
        ];

    if (isLoading) return (
        <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
            {/* Subtle Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 space-y-8 max-w-7xl mx-auto animate-pulse p-4 md:p-8">
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-8">
                    <div>
                        <div className="h-10 w-64 bg-white/10 rounded-lg mb-4" />
                        <div className="h-4 w-48 bg-white/5 rounded-md" />
                    </div>
                    <div className="h-12 w-36 bg-white/10 rounded-xl" />
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass p-6 rounded-2xl h-[140px] flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-xl bg-white/10" />
                            <div>
                                <div className="h-8 w-16 bg-white/10 rounded-md mb-2" />
                                <div className="h-3 w-24 bg-white/5 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass p-8 rounded-3xl h-[450px]">
                        <div className="flex justify-between mb-8">
                            <div className="h-6 w-48 bg-white/10 rounded-md" />
                            <div className="h-6 w-32 bg-white/10 rounded-md" />
                        </div>
                        <div className="w-full h-[300px] bg-white/5 rounded-xl" />
                    </div>
                    <div className="glass p-8 rounded-3xl h-[450px]">
                        <div className="h-6 w-32 bg-white/10 rounded-md mb-8" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5">
                                    <div className="w-9 h-9 rounded-lg bg-white/10" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-full bg-white/10 rounded-md" />
                                        <div className="h-3 w-2/3 bg-white/5 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
            {/* Subtle Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 space-y-8 max-w-7xl mx-auto p-4 md:p-8">
                {/* Error Banner */}
                {errorBanner && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-risk-critical/10 border border-risk-critical/20 text-risk-critical text-sm font-bold">
                        <AlertCircle size={18} />
                        <span className="flex-1">{errorBanner}</span>
                        <button onClick={() => setErrorBanner(null)} className="hover:opacity-70 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Portfolio Overview</h1>
                        <p className="text-text-secondary">Continuous risk monitoring for <strong>{latestAnalysis?.domain || 'primary domain'}</strong></p>
                    </div>
                    {showAnalyzeInput ? (
                        <form onSubmit={handleNewAnalysis} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/10 focus-within:border-primary/30 transition-all w-full sm:w-auto">
                                <Globe size={16} className="text-white/30" />
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="e.g. google.com"
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full sm:w-48"
                                    autoFocus
                                    disabled={mutation.isPending}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={mutation.isPending || !domain.trim()}
                                className="bg-primary hover:bg-primary/90 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                {mutation.isPending ? (
                                    <><Loader2 size={14} className="animate-spin" /> Analyzing...</>
                                ) : (
                                    'Analyze'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowAnalyzeInput(false); setDomain(''); setErrorBanner(null); }}
                                className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all w-full sm:w-auto"
                            >
                                <X size={16} />
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowAnalyzeInput(true)}
                            className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 w-full sm:w-auto"
                        >
                            New Analysis
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StateCard
                        title="Avg. Risk Score"
                        value={latestAnalysis?.overallRiskScore || 0}
                        subValue={`${latestAnalysis?.overallRiskLevel || 'Low'} Risk Level`}
                        icon={ShieldAlert}
                        colorClass="bg-primary"
                        to={latestAnalysis ? `/analysis/${latestAnalysis.id}` : undefined}
                    />
                    <StateCard
                        title="Total Assets"
                        value={latestAnalysis?.totalAssets || 0}
                        subValue="Discovered this month"
                        icon={Box}
                        colorClass="bg-secondary"
                        to={latestAnalysis ? `/analysis/${latestAnalysis.id}` : undefined}
                    />
                    <StateCard
                        title="Critical Assets"
                        value={latestAnalysis?.criticalAssets || 0}
                        subValue="Immediate attention"
                        icon={AlertCircle}
                        colorClass="bg-risk-critical"
                        to={latestAnalysis ? `/analysis/${latestAnalysis.id}` : undefined}
                    />
                    <StateCard
                        title="Monitoring Health"
                        value="98.2%"
                        subValue="System status active"
                        icon={Activity}
                        colorClass="bg-risk-low"
                        to={latestAnalysis ? `/analysis/${latestAnalysis.id}` : undefined}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass p-8 rounded-3xl h-[450px]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold">Temporal Risk Trend</h3>
                            <div className="flex gap-2">
                                {['1W', '1M', '3M', '6M', '1Y'].map(t => (
                                    <button key={t} className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${t === '1M' ? 'bg-primary text-white' : 'hover:bg-white/5 text-text-secondary'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-6">Recent Alerts</h3>
                        {analyses && analyses.length > 0 ? (
                            <div className="space-y-4">
                                {analyses.slice(0, 3).map((analysis: any, i: number) => {
                                    const riskColor = analysis.overallRiskLevel === 'Critical' ? 'risk-critical' :
                                        analysis.overallRiskLevel === 'High' ? 'risk-high' :
                                            analysis.overallRiskLevel === 'Medium' ? 'risk-medium' : 'risk-low';
                                    const timeAgo = analysis.analyzedAt ? getRelativeTime(analysis.analyzedAt) : 'recently';
                                    return (
                                        <Link key={analysis.id || i} to={`/analysis/${analysis.id}`} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer block">
                                            <div className={`p-2 rounded-lg h-fit bg-${riskColor}/20 text-${riskColor}`}>
                                                <AlertCircle size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold truncate">{analysis.domain} — {analysis.overallRiskLevel} risk</div>
                                                <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                                                    <Clock size={12} /> {timeAgo}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                                <div className="relative mb-6 group cursor-default">
                                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-colors blur-[30px] rounded-full" />
                                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center relative border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.15)] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <ShieldAlert size={32} className="text-primary/70" />
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">Perimeter Secure</h4>
                                <p className="text-sm text-text-secondary max-w-[200px]">No vulnerabilities detected. New alerts will appear here during background monitoring.</p>
                            </div>
                        )}
                        <button className="w-full mt-6 py-3 rounded-xl border border-white/[0.08] text-sm font-bold hover:bg-white/5 hover:border-white/15 transition-all duration-300">
                            See All Alerts
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function getRelativeTime(dateInput: string | Date): string {
    try {
        if (!dateInput) return 'recently';
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'recently';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        
        if (diffMs < 0) return 'just now'; // Protection against slight clock drift
        
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return 'recently';
    }
}

export default Dashboard;
