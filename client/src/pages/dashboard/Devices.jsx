import { Laptop, Tablet, Smartphone, Info } from 'lucide-react';

const DeviceItem = ({ name, type, location, date, icon: Icon }) => (
    <div className="flex items-center justify-between p-6 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-md">
                <Icon size={32} className="text-[#323130]" />
            </div>
            <div>
                <div className="font-semibold text-[#323130] text-lg">{name}</div>
                <div className="text-sm text-gray-500">{type}</div>
                <div className="text-xs text-gray-400 mt-1">{location} • Last active: {date}</div>
            </div>
        </div>
        <div className="flex gap-4">
            <button className="text-[#0067b8] hover:underline text-sm font-semibold">See details</button>
            <button className="text-[#0067b8] hover:underline text-sm font-semibold">Remove</button>
        </div>
    </div>
);

const Devices = () => {
    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130]">Devices</h1>
                <button className="flex items-center gap-2 text-[#0067b8] hover:underline font-semibold bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold">Connected to your account</h2>
                </div>

                <DeviceItem
                    name="THAPA-LAPTOP"
                    type="Windows 11 Enterprise"
                    location="Kathmandu, Nepal"
                    date="Just now"
                    icon={Laptop}
                />
                <DeviceItem
                    name="iPhone 13"
                    type="iOS 17.2"
                    location="Kathmandu, Nepal"
                    date="Yesterday"
                    icon={Smartphone}
                />
                <DeviceItem
                    name="Samsung Galaxy Tab"
                    type="Android Tablet"
                    location="Pokhara, Nepal"
                    date="Last week"
                    icon={Tablet}
                />
            </div>
        </div>
    );
};

export default Devices;
