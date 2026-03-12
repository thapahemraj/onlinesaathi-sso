import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ExternalLink, Search, Filter, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORIES = ['all', 'health', 'education', 'finance', 'housing', 'agriculture', 'employment', 'social_security', 'other'];

const CATEGORY_COLORS = {
    health: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    finance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    housing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    agriculture: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
    employment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    social_security: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function Schemes() {
    const [schemes, setSchemes] = useState([]);
    const [eligible, setEligible] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [tab, setTab] = useState('all'); // 'all' | 'eligible'

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [allRes, eligibleRes] = await Promise.all([
                    axios.get(`${API}/schemes?limit=100`, { withCredentials: true }),
                    axios.get(`${API}/schemes/eligible`, { withCredentials: true })
                ]);
                setSchemes(allRes.data.schemes || []);
                setEligible(eligibleRes.data.schemes || []);
            } catch (e) {
                setError(e.response?.data?.message || 'Failed to load schemes.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const eligibleIds = new Set(eligible.map(s => s._id));

    const filteredSchemes = (tab === 'eligible' ? eligible : schemes).filter(s => {
        const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'all' || s.category === category;
        return matchSearch && matchCat;
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                    <Star size={26} className="text-[#0078D4]" />
                    Government Schemes
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Discover welfare schemes and benefits you may qualify for.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-px bg-gray-200 dark:bg-gray-700 rounded-lg p-1 w-fit mb-6">
                {[['all', 'All Schemes'], ['eligible', `Eligible for You (${eligible.length})`]].map(([val, label]) => (
                    <button
                        key={val}
                        onClick={() => setTab(val)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === val ? 'bg-white dark:bg-[#2c2c2c] text-[#323130] dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-[#323130] dark:hover:text-white'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search schemes..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-[#323130] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="pl-8 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-sm text-[#323130] dark:text-white focus:outline-none appearance-none cursor-pointer"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('_', ' ')}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg mb-4 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading schemes...</div>
            ) : filteredSchemes.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Star size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No schemes found{tab === 'eligible' ? ' matching your profile' : ''}.</p>
                    {tab === 'eligible' && (
                        <p className="text-sm mt-2">Upload your documents to check scheme eligibility.</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSchemes.map(scheme => (
                        <div key={scheme._id} className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS.other}`}>
                                    {scheme.category?.replace('_', ' ')}
                                </span>
                                {eligibleIds.has(scheme._id) && (
                                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                                        <CheckCircle size={12} /> Eligible
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-[#323130] dark:text-white mb-2 line-clamp-2">{scheme.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{scheme.description}</p>

                            {scheme.benefits && (
                                <div className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-md px-3 py-2 mb-4">
                                    <strong>Benefit:</strong> {scheme.benefits}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                                {scheme.applicationDeadline && (
                                    <span className="text-xs text-gray-400">
                                        Deadline: {new Date(scheme.applicationDeadline).toLocaleDateString()}
                                    </span>
                                )}
                                {scheme.applicationUrl && (
                                    <a
                                        href={scheme.applicationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto inline-flex items-center gap-1 text-sm text-[#0078D4] font-medium hover:underline"
                                    >
                                        Apply <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
