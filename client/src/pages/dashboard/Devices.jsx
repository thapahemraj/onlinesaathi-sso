import { useState, useEffect } from 'react';
import { Laptop, Tablet, Smartphone, Info, Loader2, Trash2, Monitor } from 'lucide-react';
import axios from 'axios';

const getDeviceIcon = (type) => {
    switch (type) {
        case 'mobile': return Smartphone;
        case 'tablet': return Tablet;
        default: return Monitor;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DeviceItem = ({ device, onRemove, removing }) => {
    const Icon = getDeviceIcon(device.deviceType);
    return (
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <Icon size={32} className="text-[#323130] dark:text-gray-300" />
                </div>
                <div>
                    <div className="font-semibold text-[#323130] dark:text-white text-lg">{device.deviceName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{device.os}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {device.location} • Last active: {formatDate(device.lastActive)}
                    </div>
                </div>
            </div>
            <button
                onClick={() => onRemove(device._id)}
                disabled={removing === device._id}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold flex items-center gap-1 transition-colors"
            >
                {removing === device._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remove
            </button>
        </div>
    );
};

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);

    const fetchDevices = async () => {
        try {
            const { data } = await axios.get('/devices');
            setDevices(data);
        } catch (error) {
            console.error('Failed to fetch devices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDevices(); }, []);

    const handleRemove = async (id) => {
        setRemoving(id);
        try {
            await axios.delete(`/devices/${id}`);
            setDevices(prev => prev.filter(d => d._id !== id));
        } catch (error) {
            console.error('Failed to remove device:', error);
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white">Devices</h1>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Info className="text-[#0078D4] dark:text-[#4f93ce] mt-0.5" size={20} />
                <p className="text-sm text-[#0078D4] dark:text-[#4f93ce]">
                    These are the devices that have signed into your OnlineSaathi account. You can remove devices you no longer use.
                </p>
            </div>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#333]">
                    <h2 className="text-lg font-semibold dark:text-white">Connected to your account</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{devices.length} device{devices.length !== 1 ? 's' : ''} found</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-[#0078D4]" size={32} />
                    </div>
                ) : devices.length > 0 ? (
                    devices.map(device => (
                        <DeviceItem key={device._id} device={device} onRemove={handleRemove} removing={removing} />
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        No devices found. Devices will appear here after you sign in.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Devices;
