import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, User, Building, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export const AuthPage = ({ type }: { type: 'login' | 'register' }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        organization: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
        // Clear specific validation error when user types
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 2FA Submit Logic
        if (requires2FA && tempToken) {
            if (!twoFactorCode.trim()) { setValidationErrors({ twoFactorCode: '2FA Code is required.' }); return; }
            setLoading(true);
            setError(null);
            try {
                const response = await api.post('/auth/login/2fa', { tempToken, token: twoFactorCode });
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('authUser', JSON.stringify(response.data.user));
                navigate('/dashboard');
            } catch (err: any) {
                setError(err.response?.data?.error || 'Invalid 2FA code.');
            } finally {
                setLoading(false);
            }
            return;
        }

        // Custom Validation
        const valErrors: Record<string, string> = {};
        let hasError = false;

        if (type === 'register') {
            if (!formData.name.trim()) { valErrors.name = 'Full Name is required.'; hasError = true; }
            if (!formData.organization.trim()) { valErrors.organization = 'Organization is required.'; hasError = true; }
        }
        if (!formData.email.trim()) { valErrors.email = 'Email Address is required.'; hasError = true; }
        if (!formData.password) { valErrors.password = 'Password is required.'; hasError = true; }

        if (hasError) {
            setValidationErrors(valErrors);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, formData);

            if (response.data.requires2FA) {
                setRequires2FA(true);
                setTempToken(response.data.tempToken);
                return;
            }

            localStorage.setItem('authToken', response.data.token);
            // Also store user info for immediate display
            localStorage.setItem('authUser', JSON.stringify(response.data.user));

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Glows - Matching Home Page Style */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] animate-pulse-custom" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] animate-pulse-custom" style={{ animationDelay: '-4s' }} />
            </div>

            {/* Background Grid */}
            <div className="fixed inset-0 grid-background opacity-[0.03] pointer-events-none z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[480px] relative z-10"
            >
                <div className="glass p-10 md:p-12 rounded-[40px] border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <div className="mb-12 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                <ShieldAlert size={16} className="text-primary" />
                            </div>
                            <span className="text-sm font-black tracking-tight text-white uppercase">Argus</span>
                        </Link>

                        <h2 className="text-3xl font-display font-medium text-white mb-3">
                            {requires2FA ? 'Two-Factor Auth' : (type === 'login' ? 'Welcome Back' : 'Create Account')}
                        </h2>
                        <p className="text-white/30 text-sm font-medium">
                            {requires2FA ? 'Enter the code from your Authenticator app' : (type === 'login' ? 'Secure access to your intelligence' : 'Join 4,000+ security engineers')}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 rounded-2xl bg-risk-critical/10 border border-risk-critical/20 text-risk-critical flex items-center gap-3 text-xs font-bold uppercase tracking-wider"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {requires2FA ? (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Authentication Code</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        name="twoFactorCode"
                                        type="text"
                                        value={twoFactorCode}
                                        onChange={(e) => {
                                            setTwoFactorCode(e.target.value);
                                            setError(null);
                                            setValidationErrors({});
                                        }}
                                        placeholder="000000"
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-white/[0.05] transition-all tracking-[0.5em] font-mono"
                                        maxLength={6}
                                        autoComplete="off"
                                    />
                                </div>
                                {validationErrors.twoFactorCode && <p className="text-risk-critical text-[10px] font-bold ml-1">{validationErrors.twoFactorCode}</p>}
                            </div>
                        ) : (
                            <>
                                {type === 'register' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                                        />
                                    </div>
                                    {validationErrors.name && <p className="text-risk-critical text-[10px] font-bold ml-1">{validationErrors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Organization</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            name="organization"
                                            type="text"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            placeholder="Acme Inc."
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                                        />
                                    </div>
                                    {validationErrors.organization && <p className="text-risk-critical text-[10px] font-bold ml-1">{validationErrors.organization}</p>}
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                            {validationErrors.email && <p className="text-risk-critical text-[10px] font-bold ml-1">{validationErrors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Password</label>
                                {type === 'login' && (
                                    <Link to="#" className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest">Forgot?</Link>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none text-sm text-white placeholder:text-white/10 focus:border-primary/40 focus:bg-white/[0.05] transition-all"
                                />
                            </div>
                            {validationErrors.password && <p className="text-risk-critical text-[10px] font-bold ml-1">{validationErrors.password}</p>}
                        </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Authenticating...' : (requires2FA ? 'Verify 2FA' : (type === 'login' ? 'Sign In' : 'Create Account'))}
                        </button>
                    </form>

                    {!requires2FA && (
                        <div className="mt-10 text-center">
                            <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">
                                {type === 'login' ? "New to Argus?" : "Already a member?"}{' '}
                                <Link
                                    to={type === 'login' ? '/register' : '/login'}
                                    className="text-primary hover:text-primary/80 transition-colors ml-2"
                                >
                                    {type === 'login' ? 'Sign Up' : 'Log In'}
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
