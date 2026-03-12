import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, Upload, Trash2, CheckCircle, AlertCircle, Eye, Calendar } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API.replace(/\/api\/?$/, '');

const DOC_TYPES = [
    { value: 'national_id', label: 'National ID' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: "Driving License" },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'income_certificate', label: 'Income Certificate' },
    { value: 'residence_proof', label: 'Residence Proof' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'other', label: 'Other' },
];

export default function Documents() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ documentType: '', documentName: '', expiryDate: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const fileRef = useRef();

    const fetchDocs = async () => {
        try {
            const { data } = await axios.get(`${API}/documents`, { withCredentials: true });
            setDocs(data || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load documents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDocs(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return setError('Please select a file.');
        if (!form.documentType) return setError('Please select a document type.');
        if (!form.documentName.trim()) return setError('Please enter a document name.');

        setUploading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('document', selectedFile);
            fd.append('documentType', form.documentType);
            fd.append('documentName', form.documentName.trim());
            if (form.expiryDate) fd.append('expiryDate', form.expiryDate);

            await axios.post(`${API}/documents/upload`, fd, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Document uploaded successfully.');
            setShowForm(false);
            setForm({ documentType: '', documentName: '', expiryDate: '' });
            setSelectedFile(null);
            if (fileRef.current) fileRef.current.value = '';
            fetchDocs();
        } catch (e) {
            setError(e.response?.data?.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this document? This cannot be undone.')) return;
        try {
            await axios.delete(`${API}/documents/${id}`, { withCredentials: true });
            setDocs(prev => prev.filter(d => d._id !== id));
            setSuccess('Document deleted.');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to delete document.');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                        <FileText size={26} className="text-[#0078D4]" />
                        My Documents
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Upload identity and supporting documents for KYC and scheme eligibility.
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0078D4] text-white rounded-lg text-sm font-medium hover:bg-[#006cbd] transition-colors"
                >
                    <Upload size={16} />
                    {showForm ? 'Cancel' : 'Upload Document'}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg mb-4 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-lg mb-4 text-sm">
                    <CheckCircle size={16} /> {success}
                </div>
            )}

            {/* Upload Form */}
            {showForm && (
                <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6 mb-6 border border-blue-100 dark:border-[#0078D4]/30">
                    <h2 className="font-semibold text-[#323130] dark:text-white mb-4">Upload New Document</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type <span className="text-red-500">*</span></label>
                                <select
                                    value={form.documentType}
                                    onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1b1b1b] text-sm text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                                >
                                    <option value="">Select type...</option>
                                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.documentName}
                                    onChange={e => setForm(f => ({ ...f, documentName: e.target.value }))}
                                    placeholder="e.g. My Passport"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1b1b1b] text-sm text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date (optional)</label>
                                <input
                                    type="date"
                                    value={form.expiryDate}
                                    onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1b1b1b] text-sm text-[#323130] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    ref={fileRef}
                                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                                    onChange={e => setSelectedFile(e.target.files[0])}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1b1b1b] text-sm text-[#323130] dark:text-white focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#0078D4] file:text-white hover:file:bg-[#006cbd]"
                                />
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF — max 10MB</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#323130] dark:hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={uploading} className="px-5 py-2 bg-[#0078D4] text-white rounded-lg text-sm font-medium hover:bg-[#006cbd] disabled:opacity-60 transition-colors">
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Documents List */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading documents...</div>
            ) : docs.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white dark:bg-[#2c2c2c] rounded-xl">
                    <FileText size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No documents uploaded yet.</p>
                    <p className="text-sm mt-1">Upload your documents to submit for KYC verification and check scheme eligibility.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map(doc => (
                        <div key={doc._id} className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-lg bg-[#0078D4]/10 flex items-center justify-center shrink-0">
                                        <FileText size={20} className="text-[#0078D4]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#323130] dark:text-white truncate max-w-[150px]">{doc.documentName}</p>
                                        <p className="text-xs text-gray-500 capitalize">{doc.documentType?.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                                {doc.isVerified ? (
                                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full shrink-0">
                                        <CheckCircle size={10} /> Verified
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full shrink-0">Pending</span>
                                )}
                            </div>

                            {doc.expiryDate && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                    <Calendar size={11} /> Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <a
                                    href={`${API_ORIGIN}${doc.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-[#0078D4] border border-[#0078D4] rounded-lg hover:bg-[#0078D4]/5 transition-colors"
                                >
                                    <Eye size={12} /> View
                                </a>
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
