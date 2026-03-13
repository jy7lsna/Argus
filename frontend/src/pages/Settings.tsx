import { useState, useEffect } from 'react';
import { User, Shield, Bell, Globe, Key, X, Terminal, Plus, Trash2, Copy, Check } from 'lucide-react';
import api from '../services/api';

const SettingsItem = ({ icon: Icon, title, description, onClick }: any) => (
    <div onClick={onClick} className="flex items-center justify-between p-6 glass rounded-2xl hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 group-hover:bg-primary/10 rounded-xl flex items-center justify-center transition-colors">
                <Icon size={22} className="text-text-secondary group-hover:text-primary" />
            </div>
            <div>
                <h4 className="font-bold text-white">{title}</h4>
                <p className="text-sm text-text-secondary">{description}</p>
            </div>
        </div>
        <button className="text-sm font-bold text-primary hover:underline">Edit</button>
    </div>
);

const Settings = () => {
    // 2FA State
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // API Keys State
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const { data } = await api.get('/api-keys');
            setApiKeys(data);
        } catch (err) {
            console.error('Failed to fetch API keys', err);
        }
    };

    const handleEnable2FA = async () => {
        setIs2FAModalOpen(true);
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { data } = await api.post('/2fa/generate');
            setQrCodeUrl(data.qrCodeUrl);
            setTwoFactorSecret(data.secret);
        } catch (err: any) {
            setError('Failed to generate 2FA secret.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!twoFactorCode) {
            setError('Please enter the code.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await api.post('/2fa/verify', { token: twoFactorCode });
            setSuccess('2FA has been successfully enabled!');
            setTimeout(() => {
                setIs2FAModalOpen(false);
                setSuccess(null);
                setTwoFactorCode('');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid 2FA code.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (!newKeyName) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/api-keys', { name: newKeyName });
            setGeneratedKey(data.key);
            fetchApiKeys();
            setNewKeyName('');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate API Key.');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeApiKey = async (id: string) => {
        try {
            await api.delete(`/api-keys/${id}`);
            fetchApiKeys();
        } catch (err) {
            console.error('Failed to revoke API key', err);
        }
    };

    const copyToClipboard = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto relative">
            <header>
                <h1 className="text-4xl font-bold mb-2 text-white">Settings</h1>
                <p className="text-text-secondary">Manage your account, organization, and security preferences.</p>
            </header>

            <div className="space-y-6">
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 ml-1">Account</h3>
                    <div className="space-y-4">
                        <SettingsItem icon={User} title="Profile Information" description="Update your name, email, and avatar." />
                        <SettingsItem icon={Key} title="Authentication" description="Change your password and manage 2FA." onClick={handleEnable2FA} />
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 ml-1">Organization</h3>
                    <div className="space-y-4">
                        <SettingsItem icon={Shield} title="Security Policies" description="Define asset discovery and risk sensitivity." />
                        <SettingsItem icon={Globe} title="Managed Domains" description="Add or remove domains from continuous monitoring." />
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 ml-1">Notifications</h3>
                    <div className="space-y-4">
                        <SettingsItem icon={Bell} title="Alert Hub" description="Configure Slack, Discord, and Email webhooks." />
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4 ml-1">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                            <Terminal size={16} /> Developer
                        </h3>
                        <button onClick={() => { setIsApiKeyModalOpen(true); setGeneratedKey(null); }} className="text-xs bg-primary/20 hover:bg-primary/40 text-primary font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus size={14} /> Generate Key
                        </button>
                    </div>
                    
                    <div className="glass rounded-2xl overflow-hidden">
                        {apiKeys.length === 0 ? (
                            <div className="p-8 text-center text-text-secondary text-sm">No API keys generated yet.</div>
                        ) : (
                            <table className="w-full text-left text-sm text-text-secondary">
                                <thead className="bg-white/5 text-xs uppercase font-bold tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Created</th>
                                        <th className="px-6 py-4">Last Used</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {apiKeys.map(key => (
                                        <tr key={key.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">{key.name}</td>
                                            <td className="px-6 py-4">{new Date(key.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleRevokeApiKey(key.id)} className="text-risk-critical hover:text-red-400 p-2 rounded-lg hover:bg-risk-critical/10 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>

            {/* 2FA Modal */}
            {is2FAModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl">
                        <button onClick={() => setIs2FAModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold text-white mb-2">Enable 2FA</h2>
                        <p className="text-white/60 text-sm mb-6">Scan the QR code with your authenticator app.</p>

                        {error && <div className="p-3 mb-4 rounded-lg bg-risk-critical/10 border border-risk-critical/30 text-risk-critical text-sm">{error}</div>}
                        {success && <div className="p-3 mb-4 rounded-lg bg-risk-low/10 border border-risk-low/30 text-risk-low text-sm">{success}</div>}

                        {loading && !qrCodeUrl ? (
                            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                        ) : (
                            qrCodeUrl && (
                                <div className="space-y-6 flex flex-col items-center">
                                    <div className="bg-white p-2 rounded-xl">
                                        <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                    <p className="text-xs text-white/40 font-mono bg-white/5 p-2 rounded-lg break-all text-center select-all">
                                        Manual Key: {twoFactorSecret}
                                    </p>
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            value={twoFactorCode}
                                            onChange={(e) => setTwoFactorCode(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:border-primary/50 text-center tracking-[0.5em] font-mono mb-4 outline-none"
                                            maxLength={6}
                                        />
                                        <button onClick={handleVerify2FA} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                                            Verify and Enable
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* API Key Modal */}
            {isApiKeyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl">
                        <button onClick={() => { setIsApiKeyModalOpen(false); setGeneratedKey(null); }} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-2">Generate API Key</h2>
                        <p className="text-white/60 text-sm mb-6">Create a new key to systematically access the Argus API.</p>

                        {error && <div className="p-3 mb-4 rounded-lg bg-risk-critical/10 border border-risk-critical/30 text-risk-critical text-sm">{error}</div>}

                        {generatedKey ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-risk-low/10 border border-risk-low/30 text-risk-low text-sm rounded-xl">
                                    <p className="font-bold mb-1">Make sure to copy your API key now.</p>
                                    <p>You won't be able to see it again!</p>
                                </div>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={generatedKey} 
                                        readOnly 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white font-mono text-sm outline-none break-all"
                                    />
                                    <button onClick={copyToClipboard} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                        {copied ? <Check size={16} className="text-risk-low" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <button onClick={() => setIsApiKeyModalOpen(false)} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all mt-4">
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block ml-1">Key Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CI/CD Pipeline"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:border-primary/50 outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    onClick={handleGenerateApiKey} 
                                    disabled={loading || !newKeyName} 
                                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] mt-2"
                                >
                                    {loading ? 'Generating...' : 'Generate Key'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
