import { useState, useEffect } from 'react';
import axios from 'axios';
import { HeartHandshake, Star, Briefcase, ExternalLink, Search, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORY_COLORS = {
    health: 'bg-red-100 text-red-700',
    education: 'bg-blue-100 text-blue-700',
    finance: 'bg-green-100 text-green-700',
    housing: 'bg-orange-100 text-orange-700',
    agriculture: 'bg-lime-100 text-lime-700',
    employment: 'bg-purple-100 text-purple-700',
    social_security: 'bg-teal-100 text-teal-700',
    other: 'bg-gray-100 text-gray-700',
};

export default function SaathiDashboard() {
    const [schemes, setSchemes] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('schemes');

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/schemes?limit=50`, { withCredentials: true }),
            axios.get(`${API}/jobs?limit=50`, { withCredentials: true })
        ]).then(([sRes, jRes]) => {
            setSchemes(sRes.data.schemes || []);
            setJobs(jRes.data.jobs || []);
        }).finally(() => setLoading(false));
    }, []);

    const filtered = tab === 'schemes'
        ? schemes.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()))
        : jobs.filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Hero */}
                <div className="bg-gradient-to-r from-[#0078D4] to-[#1a6faa] rounded-2xl p-6 mb-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <HeartHandshake size={32} />
                        <h1 className="text-2xl font-bold">Saathi Centre</h1>
                    </div>
                    <p className="text-blue-100 text-sm">
                        Your guide to government welfare schemes and job opportunities. Help community members find the support they deserve.
                    </p>
                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="bg-white/10 rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">{schemes.length}</div>
                            <div className="text-blue-200 text-xs">Active Schemes</div>
                        </div>
                        <div className="bg-white/10 rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold">{jobs.length}</div>
                            <div className="text-blue-200 text-xs">Job Listings</div>
                        </div>
                    </div>
                </div>

                {/* Tabs + Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-px bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                        {[['schemes', 'Government Schemes', Star], ['jobs', 'Job Listings', Briefcase]].map(([val, label, Icon]) => (
                            <button
                                key={val}
                                onClick={() => setTab(val)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === val ? 'bg-white dark:bg-[#2c2c2c] text-[#323130] dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                            >
                                <Icon size={14} /> {label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`Search ${tab}...`}
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-sm text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0078D4] w-64"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No {tab} found.</div>
                ) : tab === 'schemes' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map(s => (
                            <div key={s._id} className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[s.category] || CATEGORY_COLORS.other}`}>
                                        {s.category?.replace('_', ' ')}
                                    </span>
                                    {s.applicationDeadline && (
                                        <span className="text-xs text-gray-400">
                                            Deadline: {new Date(s.applicationDeadline).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-[#323130] dark:text-white mb-1">{s.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{s.description}</p>
                                {s.benefits && (
                                    <p className="text-xs text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-3 py-1.5 rounded mb-3">
                                        <strong>Benefit:</strong> {s.benefits}
                                    </p>
                                )}
                                {s.applicationUrl && (
                                    <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-[#0078D4] font-medium hover:underline">
                                        Apply Now <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(j => (
                            <div key={j._id} className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <p className="font-semibold text-[#323130] dark:text-white">{j.title}</p>
                                        <span className="text-xs capitalize bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{j.jobType}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{j.company} · {j.location}</p>
                                </div>
                                {j.applicationUrl && (
                                    <a href={j.applicationUrl} target="_blank" rel="noopener noreferrer"
                                        className="shrink-0 px-4 py-1.5 bg-[#0078D4] text-white text-sm font-medium rounded-lg hover:bg-[#006cbd] transition-colors flex items-center gap-1">
                                        Apply <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
