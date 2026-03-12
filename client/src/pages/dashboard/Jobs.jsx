import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Clock, ExternalLink, Search, Filter, ChevronDown, AlertCircle, DollarSign } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORIES = ['all', 'technology', 'healthcare', 'finance', 'education', 'agriculture', 'retail', 'construction', 'hospitality', 'other'];
const JOB_TYPES = ['all', 'full-time', 'part-time', 'contract', 'freelance', 'internship'];

const JOB_TYPE_COLORS = {
    'full-time': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'part-time': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'contract': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'freelance': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'internship': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [jobType, setJobType] = useState('all');

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: 100 });
            if (search) params.set('search', search);
            if (category !== 'all') params.set('category', category);
            if (jobType !== 'all') params.set('jobType', jobType);
            const { data } = await axios.get(`${API}/jobs?${params}`, { withCredentials: true });
            setJobs(data.jobs || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, [category, jobType]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const formatSalary = (salary) => {
        if (!salary) return '';
        if (salary.isNegotiable) return 'Negotiable';
        if (salary.min && salary.max) return `${salary.currency} ${salary.min.toLocaleString()} – ${salary.max.toLocaleString()}`;
        if (salary.min) return `${salary.currency} ${salary.min.toLocaleString()}+`;
        return '';
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                    <Briefcase size={26} className="text-[#0078D4]" />
                    Job Listings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Browse available job opportunities.
                </p>
            </div>

            {/* Search & Filters */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search jobs or companies..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-[#323130] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                    />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select value={category} onChange={e => setCategory(e.target.value)}
                        className="pl-8 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-sm text-[#323130] dark:text-white focus:outline-none appearance-none cursor-pointer">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={jobType} onChange={e => setJobType(e.target.value)}
                        className="px-4 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2c2c2c] text-sm text-[#323130] dark:text-white focus:outline-none appearance-none cursor-pointer">
                        {JOB_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <button type="submit" className="px-5 py-2 bg-[#0078D4] text-white rounded-lg text-sm font-medium hover:bg-[#006cbd] transition-colors shrink-0">
                    Search
                </button>
            </form>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg mb-4 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading jobs...</div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No jobs found matching your search.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job._id} className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-semibold text-[#323130] dark:text-white">{job.title}</h3>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${JOB_TYPE_COLORS[job.jobType] || ''}`}>
                                            {job.jobType}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{job.company}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap mb-3">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                        {formatSalary(job.salary) && (
                                            <span className="flex items-center gap-1"><DollarSign size={12} /> {formatSalary(job.salary)}</span>
                                        )}
                                        {job.applicationDeadline && (
                                            <span className="flex items-center gap-1"><Clock size={12} /> Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>

                                    {job.requirements?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {job.requirements.slice(0, 4).map((req, i) => (
                                                <span key={i} className="text-xs bg-gray-100 dark:bg-[#1b1b1b] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                                    {req}
                                                </span>
                                            ))}
                                            {job.requirements.length > 4 && (
                                                <span className="text-xs text-gray-400">+{job.requirements.length - 4} more</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {job.applicationUrl && (
                                    <a
                                        href={job.applicationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#0078D4] text-white text-sm font-medium rounded-lg hover:bg-[#006cbd] transition-colors"
                                    >
                                        Apply <ExternalLink size={13} />
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
