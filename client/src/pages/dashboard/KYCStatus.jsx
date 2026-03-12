import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserCheck, Clock, CheckCircle, XCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_UI = {
    not_submitted: { label: 'Not Submitted', color: 'text-gray-500 bg-gray-100 dark:bg-gray-700', icon: Clock, desc: 'You have not submitted a KYC request yet.' },
    pending: { label: 'Pending Review', color: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30', icon: Clock, desc: 'Your KYC request has been submitted and is awaiting an agent.' },
    under_review: { label: 'Under Review', color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/30', icon: UserCheck, desc: 'An agent is currently reviewing your identity documents.' },
    approved: { label: 'Approved', color: 'text-green-700 bg-green-100 dark:bg-green-900/30', icon: CheckCircle, desc: 'Your identity has been verified successfully.' },
    rejected: { label: 'Rejected', color: 'text-red-700 bg-red-100 dark:bg-red-900/30', icon: XCircle, desc: 'Your KYC request was not approved. See reason below or resubmit.' },
};

export default function KYCStatus() {
    const [status, setStatus] = useState(null);
    const [record, setRecord] = useState(null);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [personalInfo, setPersonalInfo] = useState({ fullName: '', dateOfBirth: '', address: '', nationality: '' });

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/kyc/my-status`, { withCredentials: true }),
            axios.get(`${API}/documents`, { withCredentials: true })
        ]).then(([kycRes, docsRes]) => {
            setStatus(kycRes.data.kycStatus);
            setRecord(kycRes.data.kycRecord);
            setDocs(docsRes.data || []);
        }).catch(e => setError(e.response?.data?.message || 'Failed to load KYC status.'))
          .finally(() => setLoading(false));
    }, []);

    const toggleDoc = (id) => {
        setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    const submitKYC = async () => {
        if (selectedDocs.length === 0) return setError('Please select at least one document.');
        setSubmitting(true);
        setError('');
        try {
            await axios.post(`${API}/kyc/submit`, {
                documentIds: selectedDocs,
                personalInfo: {
                    fullName: personalInfo.fullName || undefined,
                    dateOfBirth: personalInfo.dateOfBirth || undefined,
                    address: personalInfo.address || undefined,
                    nationality: personalInfo.nationality || undefined
                }
            }, { withCredentials: true });
            setSuccess('KYC request submitted! You will be notified once reviewed.');
            setStatus('pending');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to submit KYC.');
        } finally {
            setSubmitting(false);
        }
    };

    const ui = STATUS_UI[status] || STATUS_UI.not_submitted;
    const StatusIcon = ui.icon;

    if (loading) return <div className="py-16 text-center text-gray-400">Loading KYC status...</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#323130] dark:text-white flex items-center gap-2">
                    <UserCheck size={26} className="text-[#0078D4]" />
                    KYC Verification
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Verify your identity to unlock full platform features and scheme eligibility.
                </p>
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

            {/* Status Card */}
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${ui.color}`}>
                        <StatusIcon size={28} />
                    </div>
                    <div>
                        <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mb-1 ${ui.color}`}>
                            {ui.label}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ui.desc}</p>
                        {record?.rejectionReason && (
                            <p className="text-sm text-red-600 mt-2 font-medium">Reason: {record.rejectionReason}</p>
                        )}
                        {record?.reviewedAt && (
                            <p className="text-xs text-gray-400 mt-1">Last updated: {new Date(record.reviewedAt).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Submission form — shown only if not submitted or rejected */}
            {['not_submitted', 'rejected'].includes(status) && (
                <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6">
                    <h2 className="font-semibold text-[#323130] dark:text-white mb-1">
                        {status === 'rejected' ? 'Resubmit KYC Request' : 'Submit KYC Request'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Select your uploaded documents below. Need to add documents first?{' '}
                        <Link to="/dashboard/documents" className="text-[#0078D4] hover:underline">Upload here</Link>.
                    </p>

                    {docs.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <FileText size={36} className="mx-auto mb-3 opacity-30" />
                            <p>No documents uploaded yet.</p>
                            <Link to="/dashboard/documents" className="inline-flex items-center gap-1 mt-3 text-sm text-[#0078D4] hover:underline font-medium">
                                Upload Documents <ArrowRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select documents to include <span className="text-red-500">*</span></p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {docs.map(doc => (
                                        <label key={doc._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedDocs.includes(doc._id) ? 'border-[#0078D4] bg-[#0078D4]/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                                            <input type="checkbox" checked={selectedDocs.includes(doc._id)} onChange={() => toggleDoc(doc._id)} className="sr-only" />
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selectedDocs.includes(doc._id) ? 'border-[#0078D4] bg-[#0078D4]' : 'border-gray-300'}`}>
                                                {selectedDocs.includes(doc._id) && <CheckCircle size={12} className="text-white" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#323130] dark:text-white">{doc.documentName}</p>
                                                <p className="text-xs text-gray-500 capitalize">{doc.documentType?.replace(/_/g, ' ')}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Optional personal info */}
                            <details className="mb-4">
                                <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-[#0078D4] mb-1">
                                    + Add personal info snapshot (optional but recommended)
                                </summary>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    {[
                                        { key: 'fullName', label: 'Full Legal Name', type: 'text' },
                                        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                                        { key: 'nationality', label: 'Nationality', type: 'text' },
                                        { key: 'address', label: 'Full Address', type: 'text' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                                            <input
                                                type={f.type}
                                                value={personalInfo[f.key]}
                                                onChange={e => setPersonalInfo(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                className="w-full px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1b1b1b] text-sm text-[#323130] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078D4]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </details>

                            <button
                                onClick={submitKYC}
                                disabled={submitting || selectedDocs.length === 0}
                                className="w-full py-3 bg-[#0078D4] text-white rounded-lg font-semibold hover:bg-[#006cbd] disabled:opacity-60 transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit KYC Request'}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
