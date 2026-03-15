import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';

const COUNTRY_CODES = ['+91', '+977', '+1', '+44'];
const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

const makeUsername = ({ firstName, lastName, email }) => {
    const emailBase = email ? email.split('@')[0] : '';
    const nameBase = [firstName, lastName].filter(Boolean).join('.');
    const base = (emailBase || nameBase || 'user').toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user';
    return `${base}${Date.now().toString().slice(-5)}`;
};

const makeTempPassword = () => `Temp@${Math.random().toString(36).slice(-6)}1A`;

const buildInitialForm = () => ({
    firstName: '',
    lastName: '',
    countryCode: '+91',
    phoneNumber: '',
    email: '',
    birthDate: '',
    gender: 'prefer_not_to_say',
    profilePhoto: null
});

export default function AddUser() {
    const navigate = useNavigate();
    const [form, setForm] = useState(buildInitialForm);
    const [photoPreview, setPhotoPreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0] || null;
        setForm((prev) => ({ ...prev, profilePhoto: file }));

        if (!file) {
            setPhotoPreview('');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(String(reader.result || ''));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const email = form.email.trim().toLowerCase();
        const phoneCore = form.phoneNumber.trim();
        const phoneNumber = phoneCore ? `${form.countryCode}${phoneCore}` : '';

        if (!firstName) {
            setError('First name is required.');
            return;
        }
        if (!lastName) {
            setError('Last name is required.');
            return;
        }
        if (!email && !phoneNumber) {
            setError('Provide at least email or phone number.');
            return;
        }

        const payload = {
            username: makeUsername({ firstName, lastName, email }),
            email,
            phoneNumber,
            password: makeTempPassword(),
            role: 'user',
            firstName,
            lastName,
            dateOfBirth: form.birthDate || undefined,
            gender: form.gender || 'prefer_not_to_say'
        };

        setSubmitting(true);
        try {
            await axios.post('/admin/users', payload);
            navigate('/dashboard/admin/users', { replace: true });
        } catch (submitError) {
            setError(submitError?.response?.data?.message || 'Failed to add user.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h1 className="text-lg font-bold uppercase tracking-wide text-blue-600">Add User</h1>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/admin/users')}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-[#2f2f2f] dark:text-gray-200"
                    title="Close form"
                    aria-label="Close form"
                >
                    <X size={14} />
                    Close Form
                </button>
            </div>

            <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2c2c2c] p-4 sm:p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">First Name</label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(event) => handleFieldChange('firstName', event.target.value)}
                                placeholder="Enter First Name"
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">Last Name</label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(event) => handleFieldChange('lastName', event.target.value)}
                                placeholder="Enter Last Name"
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">Phone No</label>
                            <div className="flex">
                                <select
                                    value={form.countryCode}
                                    onChange={(event) => handleFieldChange('countryCode', event.target.value)}
                                    className="w-28 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                >
                                    {COUNTRY_CODES.map((code) => (
                                        <option key={code} value={code}>{code}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={form.phoneNumber}
                                    onChange={(event) => handleFieldChange('phoneNumber', event.target.value)}
                                    placeholder="Enter PhoneNo"
                                    className="flex-1 rounded-r-md border-y border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) => handleFieldChange('email', event.target.value)}
                                placeholder="Enter Email"
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">BirthDate</label>
                            <input
                                type="date"
                                value={form.birthDate}
                                onChange={(event) => handleFieldChange('birthDate', event.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">Gender</label>
                            <select
                                value={form.gender}
                                onChange={(event) => handleFieldChange('gender', event.target.value)}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                {GENDERS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-300">Profile Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3b3b3b] text-sm text-gray-700 dark:text-gray-200 file:mr-3 file:border-0 file:bg-gray-100 dark:file:bg-[#444] file:px-3 file:py-2"
                            />
                            <div className="mt-3 flex h-36 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-[#303030]">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No photo uploaded</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                        >
                            {submitting && <Loader2 size={14} className="animate-spin" />}
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
