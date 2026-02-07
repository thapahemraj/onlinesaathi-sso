import { Shield, Key, RefreshCw, Smartphone } from 'lucide-react';
import BiometricSetup from '../../components/BiometricSetup';

const SecurityOption = ({ title, description, action, icon: Icon }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-gray-100 last:border-0 gap-4">
        <div className="flex items-start gap-4">
            <div className="mt-1">
                <Icon size={24} className="text-[#0078D4]" />
            </div>
            <div>
                <h3 className="font-semibold text-[#323130] text-lg">{title}</h3>
                <p className="text-sm text-gray-500 max-w-xl">{description}</p>
            </div>
        </div>
        <button className="text-[#0067b8] hover:underline text-[15px] font-semibold whitespace-nowrap">
            {action}
        </button>
    </div>
);

const Security = () => {
    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] mb-8">Security</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-green-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Shield className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-green-800">Everything looks good</h2>
                            <p className="text-sm text-green-700">You are using recommended security settings.</p>
                        </div>
                    </div>
                </div>

                <SecurityOption
                    title="Password security"
                    description="Change your password to keep your account secure. We recommend using a strong password that you don't use elsewhere."
                    action="Change password"
                    icon={Key}
                />
                <SecurityOption
                    title="Two-step verification"
                    description="Add an extra layer of security to your account. We'll ask for a code when you sign in from a new device."
                    action="Manage"
                    icon={Smartphone}
                />
                <SecurityOption
                    title="Sign-in activity"
                    description="See when and where you've signed in to your account. Review successful sign-ins and unsuccessful attempts."
                    action="View my activity"
                    icon={RefreshCw}
                />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-[#323130] dark:text-white mb-4">Advanced Security</h2>
                <BiometricSetup />
            </div>
        </div>
    );
};

export default Security;
