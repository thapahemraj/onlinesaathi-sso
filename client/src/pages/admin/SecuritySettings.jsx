import { Shield, Smartphone, Key } from 'lucide-react';

const SecuritySettings = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#323130]">Security & Authentication</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <Key size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#323130]">Password Policy</h3>
                        <p className="text-sm text-gray-500 mt-1">Configure complexity, expiration, and history requirements.</p>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked readOnly className="text-[#0078D4] focus:ring-[#0078D4] rounded" />
                                <span className="text-sm text-gray-700">Require minimum 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked readOnly className="text-[#0078D4] focus:ring-[#0078D4] rounded" />
                                <span className="text-sm text-gray-700">Require special characters</span>
                            </div>
                        </div>
                    </div>
                    <button className="ml-auto text-sm font-semibold text-[#0078D4] hover:underline">Edit</button>
                </div>

                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#323130]">Multi-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 mt-1">Enable OTP, SMS, or Authenticator App requirements.</p>
                        <div className="mt-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Optional
                            </span>
                        </div>
                    </div>
                    <button className="ml-auto text-sm font-semibold text-[#0078D4] hover:underline">Configure</button>
                </div>

                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-red-50 rounded-full text-red-600">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#323130]">Conditional Access</h3>
                        <p className="text-sm text-gray-500 mt-1">Block access based on IP, location, or device risk.</p>
                    </div>
                    <button className="ml-auto text-sm font-semibold text-[#0078D4] hover:underline">Manage</button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
