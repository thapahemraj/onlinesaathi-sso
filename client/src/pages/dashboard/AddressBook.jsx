import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit2, Star, Loader2, X } from 'lucide-react';
import axios from 'axios';

const AddressModal = ({ isOpen, onClose, onSaved, editAddress }) => {
    const [form, setForm] = useState({
        label: 'Home', fullName: '', addressLine1: '', addressLine2: '',
        city: '', state: '', postalCode: '', country: 'Nepal', phone: '', isDefault: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editAddress) {
            setForm({
                label: editAddress.label || 'Home',
                fullName: editAddress.fullName || '',
                addressLine1: editAddress.addressLine1 || '',
                addressLine2: editAddress.addressLine2 || '',
                city: editAddress.city || '',
                state: editAddress.state || '',
                postalCode: editAddress.postalCode || '',
                country: editAddress.country || 'Nepal',
                phone: editAddress.phone || '',
                isDefault: editAddress.isDefault || false
            });
        } else {
            setForm({ label: 'Home', fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'Nepal', phone: '', isDefault: false });
        }
    }, [editAddress, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editAddress) {
                await axios.put(`/profile/addresses/${editAddress._id}`, form);
            } else {
                await axios.post('/profile/addresses', form);
            }
            onSaved();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-[#323130] dark:text-white focus:border-[#0067b8] focus:outline-none text-sm";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-xl w-full max-w-lg p-6 my-8" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#323130] dark:text-white">{editAddress ? 'Edit address' : 'Add new address'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Label</label>
                            <select className={inputClass} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}>
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Full name</label>
                            <input className={inputClass} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Address line 1</label>
                        <input className={inputClass} placeholder="Street address" value={form.addressLine1} onChange={e => setForm({ ...form, addressLine1: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Address line 2 (optional)</label>
                        <input className={inputClass} placeholder="Apt, suite, unit, etc." value={form.addressLine2} onChange={e => setForm({ ...form, addressLine2: e.target.value })} />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">City</label>
                            <input className={inputClass} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">State / Province</label>
                            <input className={inputClass} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Postal code</label>
                            <input className={inputClass} value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} required />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Country</label>
                            <select className={inputClass} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                                {["Nepal", "India", "United States", "United Kingdom", "Canada", "Australia", "Japan", "Germany"].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Phone (optional)</label>
                        <input className={inputClass} type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
                        Set as default address
                    </label>
                    <button type="submit" disabled={loading} className="w-full bg-[#0067b8] text-white py-2.5 rounded-md font-semibold hover:bg-[#005da6] transition-colors text-sm">
                        {loading ? 'Saving...' : editAddress ? 'Update address' : 'Add address'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const AddressBook = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editAddr, setEditAddr] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get('/profile/addresses');
            setAddresses(data);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAddresses(); }, []);

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            await axios.delete(`/profile/addresses/${id}`);
            setAddresses(prev => prev.filter(a => a._id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (addr) => {
        setEditAddr(addr);
        setShowModal(true);
    };

    const openAdd = () => {
        setEditAddr(null);
        setShowModal(true);
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white">Address book</h1>
                <button onClick={openAdd} className="flex items-center gap-2 bg-[#0067b8] text-white px-4 py-2 rounded-md hover:bg-[#005da6] transition-colors text-sm font-semibold">
                    <Plus size={16} /> Add new
                </button>
            </div>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-[#0078D4]" size={32} />
                    </div>
                ) : addresses.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {addresses.map(addr => (
                            <div key={addr._id} className="p-6 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mt-1">
                                            <MapPin size={20} className="text-[#323130] dark:text-gray-300" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[#323130] dark:text-white flex items-center gap-2">
                                                {addr.fullName}
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{addr.label}</span>
                                                {addr.isDefault && <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[#0078D4] dark:text-[#4f93ce] rounded-full">Default</span>}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {addr.city}, {addr.state} {addr.postalCode}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{addr.country}</div>
                                            {addr.phone && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{addr.phone}</div>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEdit(addr)} className="text-[#0067b8] dark:text-[#4f93ce] hover:underline text-sm font-semibold flex items-center gap-1">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(addr._id)} disabled={deleting === addr._id} className="text-red-500 hover:text-red-700 dark:text-red-400 text-sm font-semibold flex items-center gap-1">
                                            {deleting === addr._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <MapPin size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No addresses saved</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add an address for billing or shipping</p>
                        <button onClick={openAdd} className="mt-4 text-[#0067b8] dark:text-[#4f93ce] hover:underline font-semibold text-sm">+ Add address</button>
                    </div>
                )}
            </div>

            <AddressModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={fetchAddresses} editAddress={editAddr} />
        </div>
    );
};

export default AddressBook;
