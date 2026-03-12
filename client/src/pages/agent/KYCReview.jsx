import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, FileText, User, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API.replace(/\/api\/?$/, '');

export default function KYCReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [decision, setDecision] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        axios.get(`${API}/kyc/${id}`, { withCredentials: true })
            .then(r => setRecord(r.data))
            .catch(e => setError(e.response?.data?.message || 'Failed to load KYC record.'))
            .finally(() => setLoading(false));
    }, [id]);

    const claimReview = async () => {
        try {
            await axios.put(`${API}/kyc/${id}/claim`, {}, { withCredentials: true });
            setRecord(prev => ({ ...prev, status: 'under_review' }));
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to claim review.');
        }
    };

    const submitDecision = async () => {
        if (!decision) return setError('Please select Approve or Reject.');
        if (decision === 'rejected' && !rejectionReason.trim()) return setError('Rejection reason is required.');

        setSubmitting(true);
        setError('');
        try {
            await axios.put(`${API}/kyc/${id}/review`, { decision, rejectionReason, notes }, { withCredentials: true });
            setSuccess(`KYC has been ${decision} successfully.`);
            setTimeout(() => navigate('/agent'), 2000);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to submit decision.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading KYC record...</div>;

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#1b1b1b] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/agent" className="inline-flex items-center gap-2 text-sm text-[#0078D4] hover:underline mb-6">
                    <ArrowLeft size={16} /> Back to KYC Queue
                </Link>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg mb-4">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-lg mb-4">
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                {record && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-[#0078D4]/10 flex items-center justify-center">
                                        <User size={28} className="text-[#0078D4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[#323130] dark:text-white">
                                            {record.user?.firstName || ''} {record.user?.lastName || record.user?.username}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{record.user?.email || record.user?.phoneNumber}</p>
                                        <p className="text-xs text-gray-400 mt-1">Country: {record.user?.country || 'N/A'} · KYC: {record.user?.kycStatus}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${
                                        record.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        record.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        record.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {record.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Personal Info */}
                        {record.personalInfo && Object.keys(record.personalInfo).some(k => record.personalInfo[k]) && (
                            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-[#323130] dark:text-white mb-4 flex items-center gap-2">
                                    <User size={16} /> Personal Information (as submitted)
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {record.personalInfo.fullName && <div><span className="text-gray-500">Full Name:</span> <span className="font-medium dark:text-white">{record.personalInfo.fullName}</span></div>}
                                    {record.personalInfo.dateOfBirth && <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium dark:text-white">{new Date(record.personalInfo.dateOfBirth).toLocaleDateString()}</span></div>}
                                    {record.personalInfo.nationality && <div><span className="text-gray-500">Nationality:</span> <span className="font-medium dark:text-white">{record.personalInfo.nationality}</span></div>}
                                    {record.personalInfo.address && <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium dark:text-white">{record.personalInfo.address}</span></div>}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-[#323130] dark:text-white mb-4 flex items-center gap-2">
                                <FileText size={16} /> Submitted Documents ({record.documents?.length || 0})
                            </h3>
                            {record.documents?.length === 0 ? (
                                <p className="text-gray-400 text-sm">No documents attached.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {record.documents?.map((doc, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1b1b1b] rounded-lg">
                                            <FileText size={20} className="text-[#0078D4] shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[#323130] dark:text-white capitalize truncate">
                                                    {doc.documentType?.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{doc.documentName || '—'}</p>
                                            </div>
                                            <a
                                                href={`${API_ORIGIN}${doc.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[#0078D4] hover:underline shrink-0 flex items-center gap-1"
                                            >
                                                <Eye size={12} /> View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Review Action */}
                        {['pending', 'under_review'].includes(record.status) && (
                            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm p-6">
                                <h3 className="font-semibold text-[#323130] dark:text-white mb-4">Review Decision</h3>

                                {record.status === 'pending' && (
                                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
                                        <Clock size={16} />
                                        This KYC is pending. Claim it to start review.
                                        <button onClick={claimReview} className="ml-auto px-3 py-1.5 bg-[#0078D4] text-white rounded-md text-sm font-medium hover:bg-[#006cbd]">
                                            Claim Review
                                        </button>
                                    </div>
                                )}

                                {record.status === 'under_review' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#323130] dark:text-gray-300 mb-2">Internal Notes (optional)</label>
                                            <textarea
                                                rows={3}
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-[#1b1b1b] text-[#323130] dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                                                placeholder="Add review notes..."
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setDecision('approved')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${decision === 'approved' ? 'bg-green-600 text-white' : 'border-2 border-green-600 text-green-600 hover:bg-green-50'}`}
                                            >
                                                <CheckCircle size={18} /> Approve
                                            </button>
                                            <button
                                                onClick={() => setDecision('rejected')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${decision === 'rejected' ? 'bg-red-600 text-white' : 'border-2 border-red-600 text-red-600 hover:bg-red-50'}`}
                                            >
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </div>

                                        {decision === 'rejected' && (
                                            <div>
                                                <label className="block text-sm font-medium text-[#323130] dark:text-gray-300 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                                                <textarea
                                                    rows={3}
                                                    value={rejectionReason}
                                                    onChange={e => setRejectionReason(e.target.value)}
                                                    className="w-full px-3 py-2 border border-red-300 rounded-md text-sm bg-white dark:bg-[#1b1b1b] text-[#323130] dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    placeholder="Explain why KYC is being rejected..."
                                                />
                                            </div>
                                        )}

                                        {decision && (
                                            <button
                                                onClick={submitDecision}
                                                disabled={submitting}
                                                className="w-full py-3 bg-[#0078D4] text-white rounded-lg font-semibold hover:bg-[#006cbd] disabled:opacity-60 transition-colors"
                                            >
                                                {submitting ? 'Submitting...' : `Confirm ${decision === 'approved' ? 'Approval' : 'Rejection'}`}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Already reviewed */}
                        {['approved', 'rejected'].includes(record.status) && (
                            <div className={`rounded-xl shadow-sm p-6 ${record.status === 'approved' ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                                <div className="flex items-center gap-2 font-semibold">
                                    {record.status === 'approved' ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-red-600" />}
                                    <span className={record.status === 'approved' ? 'text-green-700' : 'text-red-700'}>
                                        KYC {record.status === 'approved' ? 'Approved' : 'Rejected'}
                                        {record.reviewedAt ? ` on ${new Date(record.reviewedAt).toLocaleDateString()}` : ''}
                                    </span>
                                </div>
                                {record.rejectionReason && (
                                    <p className="text-sm text-red-600 mt-2">Reason: {record.rejectionReason}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
