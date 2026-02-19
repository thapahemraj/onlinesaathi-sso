import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Copy, Eye, EyeOff, Save, Trash2, RefreshCw, Shield } from 'lucide-react';

const AVAILABLE_SCOPES = [
    { name: 'openid', label: 'OpenID', description: 'Basic identity verification (required)' },
    { name: 'profile', label: 'Profile', description: 'Name, username, and profile picture' },
    { name: 'email', label: 'Email', description: 'Email address' },
    { name: 'phone', label: 'Phone', description: 'Phone number' },
    { name: 'address', label: 'Address', description: 'Postal address' }
];

const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: '',
        redirectUris: '', // Displayed as newline separated string
        homepageUrl: '',
        description: '',
        isEnabled: true,
        allowedScopes: ['openid', 'profile', 'email'],
        grantTypes: ['authorization_code']
    });

    // Read-only fields (loaded from backend)
    const [appData, setAppData] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetchApp();
        }
    }, [id]);

    const fetchApp = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/applications/${id}`, { withCredentials: true });
            setAppData(res.data);
            setFormData({
                name: res.data.name,
                redirectUris: res.data.redirectUris.join('\n'),
                homepageUrl: res.data.homepageUrl || '',
                description: res.data.description || '',
                isEnabled: res.data.isEnabled !== false,
                allowedScopes: res.data.allowedScopes || ['openid', 'profile', 'email'],
                grantTypes: res.data.grantTypes || ['authorization_code']
            });
        } catch (err) {
            alert('Failed to load application');
            navigate('/dashboard/admin/apps');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Process redirect URIs: split by newline, trim, remove empty
            const processedRedirects = formData.redirectUris.split('\n')
                .map(u => u.trim())
                .filter(u => u.length > 0);

            const payload = {
                ...formData,
                redirectUris: processedRedirects
            };

            if (isNew) {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/applications`, payload, { withCredentials: true });
                navigate('/dashboard/admin/apps'); // Go back to list (or we could redirect to detail of new app)
            } else {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/applications/${id}`, payload, { withCredentials: true });
                alert('Saved successfully');
                fetchApp(); // Refresh
            }
        } catch (err) {
            alert('Failed to save application');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/applications/${id}`, { withCredentials: true });
            navigate('/dashboard/admin/apps');
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/admin/apps')} className="p-2 hover:bg-white rounded-full transition-colors text-gray-600">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-[#323130]">{isNew ? 'Register an application' : formData.name}</h2>
                        <p className="text-gray-500 text-sm">
                            {isNew ? 'Register a new app to integrate with your Identity Provider.' : `Application ID: ${appData?.clientId}`}
                        </p>
                    </div>
                </div>
                {!isNew && (
                    <button onClick={handleDelete} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
                        <Trash2 size={16} />
                        Delete
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Credentials Card (Only for existing apps) */}
                {!isNew && appData && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-[#323130] mb-4">Credentials</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Application (Client) ID</label>
                                <div className="flex bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                                    <input
                                        readOnly
                                        className="bg-transparent px-3 py-2 text-sm w-full font-mono text-gray-700 outline-none"
                                        value={appData.clientId}
                                    />
                                    <button type="button" onClick={() => handleCopy(appData.clientId)} className="px-3 hover:bg-gray-100 border-l border-gray-200 text-gray-500">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Client Secret</label>
                                <div className="flex bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
                                    <input
                                        readOnly
                                        type={showSecret ? "text" : "password"}
                                        className="bg-transparent px-3 py-2 text-sm w-full font-mono text-gray-700 outline-none"
                                        value={appData.clientSecret}
                                    />
                                    <button type="button" onClick={() => setShowSecret(!showSecret)} className="px-3 hover:bg-gray-100 border-l border-gray-200 text-gray-500">
                                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button type="button" onClick={() => handleCopy(appData.clientSecret)} className="px-3 hover:bg-gray-100 border-l border-gray-200 text-gray-500">
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                    <ShieldAlert size={12} /> Make sure to copy this secret securely.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-[#323130] mb-4">Branding & Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#323130] mb-1">Display Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My App"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#323130] mb-1">Description (Optional)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="App for internal HR system"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#323130] mb-1">Homepage URL (Optional)</label>
                            <input
                                type="url"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
                                value={formData.homepageUrl}
                                onChange={e => setFormData({ ...formData, homepageUrl: e.target.value })}
                                placeholder="https://myapp.com"
                            />
                        </div>
                        {!isNew && (
                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="isEnabled"
                                    className="w-4 h-4 text-[#0067b8] border-gray-300 rounded focus:ring-[#0067b8]"
                                    checked={formData.isEnabled}
                                    onChange={e => setFormData({ ...formData, isEnabled: e.target.checked })}
                                />
                                <label htmlFor="isEnabled" className="text-sm text-[#323130]">Enable this application for users to sign in?</label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Authentication Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-[#323130] mb-4">Authentication</h3>
                    <div>
                        <label className="block text-sm font-semibold text-[#323130] mb-1">Redirect URIs</label>
                        <p className="text-xs text-gray-500 mb-2">The URLs where we will send tokens after authentication. One per line.</p>
                        <textarea
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
                            value={formData.redirectUris}
                            onChange={e => setFormData({ ...formData, redirectUris: e.target.value })}
                            placeholder={`https://myapp.com/callback\nhttp://localhost:3000/api/auth/callback`}
                        ></textarea>
                    </div>
                </div>

                {/* Permissions & Scopes */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-[#323130]">Permissions & Scopes</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Select the scopes this application is allowed to request when authenticating users.</p>
                    <div className="space-y-3">
                        {AVAILABLE_SCOPES.map(scope => (
                            <label key={scope.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 mt-0.5 text-[#0067b8] border-gray-300 rounded focus:ring-[#0067b8]"
                                    checked={formData.allowedScopes.includes(scope.name)}
                                    disabled={scope.name === 'openid'}
                                    onChange={(e) => {
                                        if (scope.name === 'openid') return;
                                        const updated = e.target.checked
                                            ? [...formData.allowedScopes, scope.name]
                                            : formData.allowedScopes.filter(s => s !== scope.name);
                                        setFormData({ ...formData, allowedScopes: updated });
                                    }}
                                />
                                <div>
                                    <span className="text-sm font-medium text-[#323130]">{scope.label}</span>
                                    <span className="ml-2 text-xs text-gray-400 font-mono">{scope.name}</span>
                                    <p className="text-xs text-gray-500 mt-0.5">{scope.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#0067b8] text-white px-6 py-2 rounded-md font-semibold shadow-sm hover:bg-[#005a9e] transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ApplicationDetail;
