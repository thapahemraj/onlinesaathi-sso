import { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, Save } from 'lucide-react';

const COUNTRIES = ['India', 'Nepal'];
const STATES = ['Delhi', 'Bagmati', 'Bihar', 'Uttar Pradesh', 'Maharashtra'];
const DISTRICTS = ['Delhi', 'Kathmandu', 'Patna', 'Lucknow', 'Mumbai'];
const PARTNER_TYPES = ['State Partner', 'Regional Partner', 'Enterprise Partner'];
const AREA_OF_EXPERTISE = ['Public Services', 'Finance', 'KYC', 'Welfare Schemes', 'Employment'];
const COUNTRY_CODES = ['+91', '+977', '+1', '+44'];
const GENDERS = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

const buildInitialForm = () => ({
    country: '',
    state: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    email: '',
    countryCode: '+91',
    mobileNo: '',
    aadharNo: '',
    panNo: '',
    logoFile: null,
    signatureFile: null,
    partnerType: '',
    areaOfExpertise: '',
    about: '',
    currentAddress: '',
    currentCountry: '',
    currentState: '',
    currentDistrict: '',
    currentPinCode: '',
    permanentAddress: '',
    permanentCountry: '',
    permanentState: '',
    permanentDistrict: '',
    permanentPinCode: '',
    sameAsCurrent: false,
    documents: []
});

const makeUsername = ({ firstName, lastName, email }) => {
    const emailBase = email ? email.split('@')[0] : '';
    const nameBase = [firstName, lastName].filter(Boolean).join('.');
    const base = (emailBase || nameBase || 'statepartner').toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'statepartner';
    return `${base}${Date.now().toString().slice(-5)}`;
};

const makeTempPassword = () => `Temp@${Math.random().toString(36).slice(-6)}1A`;

export default function AddStatePartner() {
    const navigate = useNavigate();
    const [form, setForm] = useState(buildInitialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const normalizedPhone = useMemo(() => {
        const mobile = form.mobileNo.trim();
        return mobile ? `${form.countryCode}${mobile}` : '';
    }, [form.countryCode, form.mobileNo]);

    const handleChange = (field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (!next.sameAsCurrent) return next;

            return {
                ...next,
                permanentAddress: next.currentAddress,
                permanentCountry: next.currentCountry,
                permanentState: next.currentState,
                permanentDistrict: next.currentDistrict,
                permanentPinCode: next.currentPinCode
            };
        });
    };

    const handleSameAsCurrent = (checked) => {
        setForm((prev) => {
            if (!checked) {
                return { ...prev, sameAsCurrent: false };
            }

            return {
                ...prev,
                sameAsCurrent: true,
                permanentAddress: prev.currentAddress,
                permanentCountry: prev.currentCountry,
                permanentState: prev.currentState,
                permanentDistrict: prev.currentDistrict,
                permanentPinCode: prev.currentPinCode
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const email = form.email.trim().toLowerCase();

        if (!firstName) {
            setError('First name is required.');
            return;
        }
        if (!lastName) {
            setError('Last name is required.');
            return;
        }
        if (!email && !normalizedPhone) {
            setError('Provide at least email or mobile number.');
            return;
        }
        if (!form.country || !form.state) {
            setError('Country and state are required.');
            return;
        }

        const payload = {
            username: makeUsername({ firstName, lastName, email }),
            email,
            phoneNumber: normalizedPhone,
            password: makeTempPassword(),
            role: 'subAdmin',
            firstName,
            lastName,
            dateOfBirth: form.birthDate || undefined,
            gender: form.gender || undefined,
            country: form.country,
            state: form.state,
            city: form.state,
            partnerType: form.partnerType || undefined,
            areaOfExpertise: form.areaOfExpertise || undefined,
            about: form.about || undefined,
            aadharNo: form.aadharNo || undefined,
            panNo: form.panNo || undefined,
            currentAddress: form.currentAddress || undefined,
            currentCountry: form.currentCountry || undefined,
            currentState: form.currentState || undefined,
            currentDistrict: form.currentDistrict || undefined,
            currentPinCode: form.currentPinCode || undefined,
            permanentAddress: form.permanentAddress || undefined,
            permanentCountry: form.permanentCountry || undefined,
            permanentState: form.permanentState || undefined,
            permanentDistrict: form.permanentDistrict || undefined,
            permanentPinCode: form.permanentPinCode || undefined,
            isActive: true
        };

        setSaving(true);
        try {
            await axios.post('/admin/users', payload);
            navigate('/dashboard/admin/state-partner', { replace: true });
        } catch (submitError) {
            setError(submitError?.response?.data?.message || 'Failed to add state partner.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h1 className="text-lg font-bold uppercase tracking-wide text-blue-600">Add State Partner</h1>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/admin/state-partner')}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-[#2f2f2f] dark:text-gray-200"
                    title="Close form"
                    aria-label="Close form"
                >
                    <X size={14} />
                    Close Form
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-gray-200 bg-[#f7f7f8] p-4 dark:border-gray-700 dark:bg-[#303030]">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select Country for State Partner</label>
                        <select value={form.country} onChange={(e) => handleChange('country', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                            <option value="">Select Country</option>
                            {COUNTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select State for State Partner</label>
                        <select value={form.state} onChange={(e) => handleChange('state', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                            <option value="">Select State</option>
                            {STATES.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-blue-600">Basic Details</h3>
                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">First Name</label>
                            <input type="text" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} placeholder="Enter First Name" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Last Name</label>
                            <input type="text" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} placeholder="Enter Last Name" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Birth Date</label>
                            <input type="date" value={form.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Gender</label>
                            <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                                {GENDERS.map((item) => <option key={item.value || 'empty'} value={item.value}>{item.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Email</label>
                            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="Enter Email" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mobile No</label>
                            <div className="flex">
                                <select value={form.countryCode} onChange={(e) => handleChange('countryCode', e.target.value)} className="w-28 rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                                    {COUNTRY_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
                                </select>
                                <input type="text" value={form.mobileNo} onChange={(e) => handleChange('mobileNo', e.target.value)} placeholder="Enter Mobile No" className="flex-1 rounded-r-md border-y border-r border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Aadhar Card No</label>
                            <input type="text" value={form.aadharNo} onChange={(e) => handleChange('aadharNo', e.target.value)} placeholder="Enter Aadhar Card Number" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pan Card No</label>
                            <input type="text" value={form.panNo} onChange={(e) => handleChange('panNo', e.target.value)} placeholder="Enter PanCard No" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Logo</label>
                            <input type="file" accept="image/*" onChange={(e) => handleChange('logoFile', e.target.files?.[0] || null)} className="w-full rounded-md border border-gray-300 bg-white text-sm file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-2 dark:border-gray-600 dark:bg-[#3b3b3b] dark:file:bg-[#444]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Signature</label>
                            <input type="file" accept="image/*" onChange={(e) => handleChange('signatureFile', e.target.files?.[0] || null)} className="w-full rounded-md border border-gray-300 bg-white text-sm file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-2 dark:border-gray-600 dark:bg-[#3b3b3b] dark:file:bg-[#444]" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Partner Type</label>
                            <select value={form.partnerType} onChange={(e) => handleChange('partnerType', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select Partner Type</option>
                                {PARTNER_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Area Of Expertise</label>
                            <select value={form.areaOfExpertise} onChange={(e) => handleChange('areaOfExpertise', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select Area Of Expertise</option>
                                {AREA_OF_EXPERTISE.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">About</label>
                            <textarea value={form.about} onChange={(e) => handleChange('about', e.target.value)} placeholder="Enter About" rows={3} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-blue-600">Current Address Details</h3>
                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Address</label>
                            <textarea value={form.currentAddress} onChange={(e) => handleChange('currentAddress', e.target.value)} placeholder="Enter Your Address" rows={2} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <button type="button" className="w-fit text-sm font-medium text-blue-600">Use my current location</button>
                        <div />
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Country</label>
                            <select value={form.currentCountry} onChange={(e) => handleChange('currentCountry', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select Country</option>
                                {COUNTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">State</label>
                            <select value={form.currentState} onChange={(e) => handleChange('currentState', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select State</option>
                                {STATES.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">District</label>
                            <select value={form.currentDistrict} onChange={(e) => handleChange('currentDistrict', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select District</option>
                                {DISTRICTS.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pin Code</label>
                            <input type="text" value={form.currentPinCode} onChange={(e) => handleChange('currentPinCode', e.target.value)} placeholder="Enter PinCode" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-blue-600">Permanent Address Details</h3>
                    <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Address</label>
                            <textarea value={form.permanentAddress} onChange={(e) => handleChange('permanentAddress', e.target.value)} placeholder="Enter Your Address" rows={2} disabled={form.sameAsCurrent} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-70 dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                        <button type="button" className="w-fit text-sm font-medium text-blue-600">Use my current location</button>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                            <input type="checkbox" checked={form.sameAsCurrent} onChange={(e) => handleSameAsCurrent(e.target.checked)} className="h-4 w-4" />
                            Same as current address
                        </label>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Country</label>
                            <select value={form.permanentCountry} onChange={(e) => handleChange('permanentCountry', e.target.value)} disabled={form.sameAsCurrent} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-70 dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select Country</option>
                                {COUNTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">State</label>
                            <select value={form.permanentState} onChange={(e) => handleChange('permanentState', e.target.value)} disabled={form.sameAsCurrent} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-70 dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select State</option>
                                {STATES.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">District</label>
                            <select value={form.permanentDistrict} onChange={(e) => handleChange('permanentDistrict', e.target.value)} disabled={form.sameAsCurrent} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-70 dark:border-gray-600 dark:bg-[#3b3b3b]">
                                <option value="">Select District</option>
                                {DISTRICTS.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pin Code</label>
                            <input type="text" value={form.permanentPinCode} onChange={(e) => handleChange('permanentPinCode', e.target.value)} placeholder="Enter PinCode" disabled={form.sameAsCurrent} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-70 dark:border-gray-600 dark:bg-[#3b3b3b]" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold uppercase tracking-wide text-blue-600">Upload Documents</h3>
                    <label htmlFor="add-state-partner-documents" className="mt-2 flex h-14 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 bg-white px-4 text-sm text-green-700 dark:border-gray-600 dark:bg-[#2e2e2e]">
                        Drop files here or click to upload.
                    </label>
                    <input id="add-state-partner-documents" type="file" multiple className="hidden" onChange={(e) => handleChange('documents', Array.from(e.target.files || []))} />
                    {form.documents.length > 0 && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{form.documents.length} file(s) selected</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
                        <Save size={14} />
                        {saving ? 'Saving...' : 'Save Partner'}
                    </button>
                </div>
            </form>
        </div>
    );
}
