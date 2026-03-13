import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Download,
    ShieldCheck,
    ShieldAlert,
    Globe,
    Server,
    Box,
    Loader2,
    FileText
} from 'lucide-react';
import { analysisService } from '../services/analysisService';

const RiskLevelBadge = ({ level }: { level: string }) => {
    const colors: Record<string, string> = {
        Critical: 'bg-risk-critical/10 text-risk-critical border-risk-critical/20',
        High: 'bg-risk-high/10 text-risk-high border-risk-high/20',
        Medium: 'bg-risk-medium/10 text-risk-medium border-risk-medium/20',
        Low: 'bg-risk-low/10 text-risk-low border-risk-low/20',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${colors[level] || colors.Low}`}>
            {level || 'Low'}
        </span>
    );
};

const AnalysisDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [exportingJson, setExportingJson] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    const { data: analysis, isLoading, isError, error } = useQuery({
        queryKey: ['analysis', id],
        queryFn: () => analysisService.getAnalysisById(id!),
        enabled: !!id,
        retry: 1
    });

    const handleExportJson = async () => {
        if (!analysis) return;
        setExportingJson(true);
        try {
            await analysisService.exportJson(analysis.id, analysis.domain);
        } catch (err) {
            console.error('JSON export failed:', err);
        } finally {
            setExportingJson(false);
        }
    };

    const handleExportPdf = async () => {
        if (!analysis) return;
        setExportingPdf(true);
        try {
            await analysisService.exportPdf(analysis.id, analysis.domain);
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setExportingPdf(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="text-white font-medium">Fetching analysis data...</div>
            </div>
        </div>
    );

    if (isError) return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-white gap-6">
            <div className="w-16 h-16 bg-risk-critical/10 rounded-full flex items-center justify-center">
                <ShieldAlert size={32} className="text-risk-critical" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Failed to load analysis</h2>
                <p className="text-white/40 max-w-md">{(error as any)?.response?.data?.error || (error as Error).message || "An unexpected error occurred while fetching the analysis details."}</p>
            </div>
            <Link to="/dashboard" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-all">
                Return to Dashboard
            </Link>
        </div>
    );

    if (!analysis) return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-white gap-6">
            <div className="text-xl font-bold">Analysis not found.</div>
            <Link to="/dashboard" className="bg-primary px-6 py-2 rounded-xl">Back to Dashboard</Link>
        </div>
    );

    const assetList = Array.isArray(analysis.assets) ? analysis.assets : [];
    
    // Robust date discovery
    const dateStr = analysis.analyzedAt || analysis.analyzed_at || analysis.createdAt || analysis.created_at;
    
    let formattedDate = 'recently';
    if (dateStr) {
        try {
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toLocaleDateString(undefined, { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (e) {
            console.error("Date formatting error:", e);
        }
    }

    return (
        <div className="space-y-12">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div className="flex gap-4">
                        <button
                            onClick={handleExportJson}
                            disabled={exportingJson}
                            className="flex items-center gap-2 glass px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/5 transition-all text-white/80 disabled:opacity-50"
                        >
                            {exportingJson ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} />}
                            JSON
                        </button>
                        <button
                            onClick={handleExportPdf}
                            disabled={exportingPdf}
                            className="flex items-center gap-2 bg-primary px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileText size={18} />}
                            Export Report
                        </button>
                    </div>
                </div>

                <header className="space-y-4">
                    <div className="flex items-center gap-6">
                        <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight">
                            {analysis.domain || 'Unknown Domain'}
                        </h1>
                        <RiskLevelBadge level={analysis.overallRiskLevel || 'Low'} />
                    </div>
                    <p className="text-white/40 font-medium">
                        Comprehensive digital footprint analysis generated on <span className="text-white/60">{formattedDate}</span>
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass p-8 md:p-10 rounded-[40px]">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <Box size={24} className="text-primary" />
                                Asset Inventory
                                <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-white/40 uppercase tracking-widest font-black ml-auto">
                                    {assetList.length} Found
                                </span>
                            </h3>

                            {assetList.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5 text-white/20 text-[10px] uppercase tracking-[0.2em] font-black">
                                                <th className="pb-6">Asset Name</th>
                                                <th className="pb-6">Category</th>
                                                <th className="pb-6">Risk Level</th>
                                                <th className="pb-6 text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {assetList.map((asset: any, idx: number) => (
                                                <tr key={asset.id || `asset-${idx}`} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-6">
                                                        <div className="font-bold flex items-center gap-3 text-white/90">
                                                            {asset.type === 'Domain' ?
                                                                <Globe size={16} className="text-primary/60" /> :
                                                                <Server size={16} className="text-secondary/60" />
                                                            }
                                                            {asset.name || 'Unnamed Asset'}
                                                        </div>
                                                        <div className="text-xs text-white/20 mt-1 font-medium">{asset.url || ''}</div>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{asset.category || 'Technical'}</span>
                                                    </td>
                                                    <td className="py-6">
                                                        <RiskLevelBadge level={asset.riskLevel || 'Low'} />
                                                    </td>
                                                    <td className="py-6 text-right">
                                                        <div className="font-display font-medium text-xl text-white/90">{asset.riskScore ?? 0}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-16 text-center text-white/30 text-sm">No assets discovered in this analysis.</div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass p-10 rounded-[40px]">
                            <h3 className="text-xl font-bold mb-8">Risk Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <span className="text-sm font-medium text-white/30">Infrastructure Scale</span>
                                    <span className="font-bold text-lg">{analysis.totalAssets ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <span className="text-sm font-medium text-white/30">Exposure Points</span>
                                    <span className="font-bold text-lg text-risk-critical">{analysis.criticalAssets ?? 0}</span>
                                </div>
                                <div className="flex flex-col gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-primary/80">Overall Exposure</span>
                                        <span className="font-display font-medium text-3xl">{(analysis.overallRiskScore ?? 0)}<span className="text-lg text-primary/40">/100</span></span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                            style={{ width: `${Math.min(100, analysis.overallRiskScore ?? 0)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-10 rounded-[40px] bg-gradient-to-br from-primary/15 to-transparent border-primary/10 relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={160} />
                            </div>
                            <ShieldCheck size={32} className="text-primary mb-6" />
                            <h4 className="text-xl font-bold mb-3">Verified Monitoring</h4>
                            <p className="text-sm text-white/40 leading-relaxed font-medium">
                                Argus is continuously tracing this domain. Any new asset discovery or configuration change will trigger an immediate alert.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDetail;
