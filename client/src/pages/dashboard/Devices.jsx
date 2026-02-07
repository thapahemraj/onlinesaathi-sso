import { useState, useEffect } from 'react';
import axios from 'axios';
import { Laptop, Tablet, Smartphone, Info, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DeviceItem = ({ device }) => {
    let Icon = Laptop;
    if (device.deviceType === 'mobile') Icon = Smartphone;
    if (device.deviceType === 'tablet') Icon = Tablet;
    // Map other types if needed

    return (
        <div className="flex items-center justify-between p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-md ${device.isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-[#323130]'}`}>
                    <Icon size={32} />
                </div>
                <div>
                    <div className="font-semibold text-[#323130] text-lg flex items-center gap-2">
                        {device.deviceName}
                        {device.isCurrent && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Current session</span>}
                    </div>
                    <div className="text-sm text-gray-500">{device.platform} • {device.browser}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {device.location !== 'Unknown' && <span>{device.location} • </span>}
                        Last active: {formatDistanceToNow(new Date(device.lastActive))} ago
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="text-[#0067b8] hover:underline text-sm font-semibold">See details</button>
                {!device.isCurrent && (
                    <button className="text-[#0067b8] hover:underline text-sm font-semibold">Remove</button>
                )}
            </div>
        </div>
    );
};

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/devices`, {
                    withCredentials: true
                });
                setDevices(data);
            } catch (error) {
                console.error("Failed to fetch devices", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white">Devices</h1>
                <button className="flex items-center gap-2 text-[#0067b8] hover:underline font-semibold bg-white dark:bg-[#3b3b3b] dark:text-white px-4 py-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                    <span>+</span> Register device
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                <Info className="text-[#0078D4] mt-0.5" size={20} />
                <p className="text-sm text-[#0078D4]">
                    We can help you find your lost Windows 10/11 device, lock it remotely, or erase your data.
                    Make sure you've enabled "Find my device" on your machine.
                </p>
            </div>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-[#3b3b3b]">
                    <h2 className="text-lg font-semibold text-[#323130] dark:text-white">Connected to your account</h2>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : devices.length > 0 ? (
                    devices.map(device => (
                        <DeviceItem key={device._id} device={device} />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No devices found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Devices;
