import { Shield, Smartphone, Key } from 'lucide-react';

const SecuritySettings = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#323130] dark:text-white">Security & Authentication</h2>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
                        <Key size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#323130] dark:text-white">Password Policy</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure complexity, expiration, and history requirements.</p>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked readOnly className="text-[#0078D4] focus:ring-[#0078D4] rounded dark:bg-[#3b3b3b] dark:border-gray-700" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Require minimum 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked readOnly className="text-[#0078D4] focus:ring-[#0078D4] rounded dark:bg-[#3b3b3b] dark:border-gray-700" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Require special characters</span>
                            </div>
                        </div>
                    </div>
                    <button className="ml-auto text-sm font-semibold text-[#0078D4] hover:underline">Edit</button>
                </div>

                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#323130] dark:text-white">Multi-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enable OTP, SMS, or Authenticator App requirements.</p>
                        <div className="mt-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                                Optional
                            </span>
                        </div>
                    </div>
                    <button className="ml-auto text-sm font-semibold text-[#0078D4] hover:underline">Configure</button>
                </div>

                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#323130] dark:text-white">Conditional Access</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Block access based on IP, location, or device risk.</p>
                    </div>
                    <button className="ml-auto text-sm font-semibold text-[#0078D4] hover:underline">Manage</button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
