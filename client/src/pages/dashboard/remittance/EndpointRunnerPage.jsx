import { useMemo, useState } from 'react';
import axios from 'axios';
import { Home, Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getParamsFromPath = (path) => {
    const matches = path.match(/\{[^}]+\}/g) || [];
    return matches.map((token) => token.replace(/[{}]/g, ''));
};

const pretty = (value) => {
    try {
        if (typeof value === 'string') return value;
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

const EndpointRunnerPage = ({ title, endpoints = [] }) => {
    const navigate = useNavigate();

    const [selectedPath, setSelectedPath] = useState(endpoints[0]?.path || '');
    const [bodyText, setBodyText] = useState('{\n\n}');
    const [pathParams, setPathParams] = useState({});
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [history, setHistory] = useState([]);

    const selectedEndpoint = useMemo(
        () => endpoints.find((endpoint) => endpoint.path === selectedPath) || endpoints[0],
        [endpoints, selectedPath]
    );

    const pathParamKeys = useMemo(
        () => getParamsFromPath(selectedEndpoint?.path || ''),
        [selectedEndpoint]
    );

    const resolvedPath = useMemo(() => {
        let value = selectedEndpoint?.path || '';
        pathParamKeys.forEach((key) => {
            const replacement = String(pathParams[key] || '').trim();
            value = value.replace(`{${key}}`, replacement || `{${key}}`);
        });
        return value;
    }, [selectedEndpoint, pathParamKeys, pathParams]);

    const handleParamChange = (key, value) => {
        setPathParams((prev) => ({ ...prev, [key]: value }));
    };

    const runEndpoint = async () => {
        if (!selectedEndpoint) return;

        for (const key of pathParamKeys) {
            if (!String(pathParams[key] || '').trim()) {
                setResponse({ ok: false, status: 400, data: { message: `Path param '${key}' is required.` } });
                return;
            }
        }

        let payload;
        if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)) {
            try {
                payload = bodyText.trim() ? JSON.parse(bodyText) : {};
            } catch {
                setResponse({ ok: false, status: 400, data: { message: 'Invalid JSON body' } });
                return;
            }
        }

        setLoading(true);
        try {
            const res = await axios({
                method: selectedEndpoint.method,
                url: resolvedPath,
                data: payload,
                withCredentials: true
            });

            const result = {
                ok: true,
                status: res.status,
                data: res.data,
                path: resolvedPath,
                method: selectedEndpoint.method,
                timestamp: new Date().toISOString()
            };
            setResponse(result);
            setHistory((prev) => [result, ...prev].slice(0, 20));
        } catch (error) {
            const result = {
                ok: false,
                status: error?.response?.status || 500,
                data: error?.response?.data || { message: error.message },
                path: resolvedPath,
                method: selectedEndpoint.method,
                timestamp: new Date().toISOString()
            };
            setResponse(result);
            setHistory((prev) => [result, ...prev].slice(0, 20));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold dark:text-white">{title}</h1>
                <button
                    onClick={() => navigate('/dashboard/services')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    <Home size={14} /> Home
                </button>
            </div>

            <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Endpoint</label>
                        <select
                            value={selectedPath}
                            onChange={(e) => setSelectedPath(e.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm dark:text-white"
                        >
                            {endpoints.map((endpoint) => (
                                <option key={`${endpoint.method}-${endpoint.path}`} value={endpoint.path}>
                                    {endpoint.method} {endpoint.path}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={runEndpoint}
                            disabled={loading || !selectedEndpoint}
                            className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                            Run {selectedEndpoint?.method}
                        </button>
                    </div>
                </div>

                {pathParamKeys.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Path Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {pathParamKeys.map((key) => (
                                <input
                                    key={key}
                                    value={pathParams[key] || ''}
                                    onChange={(e) => handleParamChange(key, e.target.value)}
                                    placeholder={key}
                                    className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] px-3 py-2 text-sm dark:text-white"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint?.method) && (
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Request Body (JSON)</label>
                        <textarea
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            rows={8}
                            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] px-3 py-2 text-xs font-mono dark:text-white"
                        />
                    </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Resolved URL: <span className="font-mono">/api{resolvedPath}</span>
                </div>
            </section>

            <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold dark:text-white mb-3">Latest Response</h2>
                {!response ? (
                    <p className="text-sm text-gray-500">Run an endpoint to see response.</p>
                ) : (
                    <div className={`rounded-lg p-3 text-sm ${response.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {response.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span className="font-semibold">{response.method} {response.path}</span>
                            <span className="ml-auto">HTTP {response.status}</span>
                        </div>
                        <pre className="whitespace-pre-wrap break-all text-xs bg-black/5 rounded p-2 overflow-auto max-h-[340px]">
                            {pretty(response.data)}
                        </pre>
                    </div>
                )}
            </section>

            <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold dark:text-white mb-3">Recent Calls</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400">
                                <th className="py-2 pr-3">Time</th>
                                <th className="py-2 pr-3">Method</th>
                                <th className="py-2 pr-3">Path</th>
                                <th className="py-2 pr-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, idx) => (
                                <tr key={`${item.timestamp}-${idx}`} className="border-t border-gray-100 dark:border-gray-700">
                                    <td className="py-2 pr-3 text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</td>
                                    <td className="py-2 pr-3">{item.method}</td>
                                    <td className="py-2 pr-3 font-mono text-xs">{item.path}</td>
                                    <td className={`py-2 pr-3 font-semibold ${item.ok ? 'text-green-600' : 'text-red-600'}`}>{item.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {history.length === 0 && <p className="text-sm text-gray-500 mt-2">No calls yet.</p>}
                </div>
            </section>
        </div>
    );
};

export default EndpointRunnerPage;
