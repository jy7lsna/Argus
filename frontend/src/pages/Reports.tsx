import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { useState } from 'react';

const RiskBadge = ({ level }: { level: string }) => {
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

const Reports = () => {
    const { data: analyses, isLoading } = useQuery({
        queryKey: ['analyses'],
        queryFn: analysisService.getAnalyses,
    });

    const [exportingId, setExportingId] = useState<string | null>(null);

    const handleExportJson = async (id: string, domain: string) => {
        setExportingId(id + '-json');
        try {
            await analysisService.exportJson(id, domain);
        } catch (err) {
            console.error('JSON export failed:', err);
        } finally {
            setExportingId(null);
        }
    };

    const handleExportPdf = async (id: string, domain: string) => {
        setExportingId(id + '-pdf');
        try {
            await analysisService.exportPdf(id, domain);
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setExportingId(null);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-4xl font-bold mb-2 text-white">Security Reports</h1>
                <p className="text-text-secondary">Export and manage your security analysis documentation.</p>
            </header>

            {isLoading ? (
                <div className="glass p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                    <span className="text-text-secondary text-sm">Loading reports...</span>
                </div>
            ) : analyses && analyses.length > 0 ? (
                <div className="space-y-4">
                    {analyses.map((analysis: any) => {
                        let dateDisplay = 'Unknown Date';
                        try {
                            const d = new Date(analysis.analyzed_at || analysis.analyzedAt);
                            if (!isNaN(d.getTime())) {
                                dateDisplay = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                            }
                        } catch { /* noop */ }

                        return (
                            <div
                                key={analysis.id}
                                className="glass p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 group hover:border-white/15 transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <FileText size={22} className="text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Link to={`/analysis/${analysis.id}`} className="text-lg font-bold text-white hover:text-primary transition-colors truncate">
                                            {analysis.domain}
                                        </Link>
                                        <RiskBadge level={analysis.overallRiskLevel} />
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} /> {dateDisplay}
                                        </span>
                                        <span>{analysis.totalAssets ?? 0} assets</span>
                                        <span>Score: {analysis.overallRiskScore ?? 0}/100</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleExportJson(analysis.id, analysis.domain)}
                                        disabled={exportingId === analysis.id + '-json'}
                                        className="flex items-center gap-2 glass px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/5 transition-all text-white/70 disabled:opacity-50"
                                    >
                                        {exportingId === analysis.id + '-json' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => handleExportPdf(analysis.id, analysis.domain)}
                                        disabled={exportingId === analysis.id + '-pdf'}
                                        className="flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all disabled:opacity-50"
                                    >
                                        {exportingId === analysis.id + '-pdf' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                        PDF
                                    </button>
                                    <Link
                                        to={`/analysis/${analysis.id}`}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        View <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="glass p-8 rounded-3xl min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-text-secondary">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Reports Generated</h3>
                    <p className="text-text-secondary max-w-sm">Run a domain analysis to generate your first security posture report.</p>
                </div>
            )}
        </div>
    );
};

export default Reports;
