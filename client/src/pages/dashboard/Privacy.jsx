import { Eye, MapPin, History, Globe } from 'lucide-react';

const PrivacyCard = ({ title, description, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 text-[#0078D4]">
            <Icon size={32} />
        </div>
        <h3 className="text-lg font-semibold text-[#323130] mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        <button className="text-[#0067b8] hover:underline text-[15px] font-semibold bg-gray-50 px-4 py-2 rounded border border-gray-200 w-full text-center">
            View details
        </button>
    </div>
);

const Privacy = () => {
    return (
        <div className="max-w-5xl">
            <h1 className="text-3xl font-bold text-[#323130] mb-4">Privacy</h1>
            <p className="text-[#323130] mb-8 max-w-3xl">
                You should be in control of your data. We have tools that let you handle your privacy in a way that's right for you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PrivacyCard
                    title="Location activity"
                    description="Manage the location data we've collected from your devices."
                    icon={MapPin}
                />
                <PrivacyCard
                    title="Browsing history"
                    description="See and clear your browsing history from OnlineSaathi."
                    icon={Globe}
                />
                <PrivacyCard
                    title="Search history"
                    description="View and clear the searches you've made on OnlineSaathi."
                    icon={History}
                />
                <PrivacyCard
                    title="App and service activity"
                    description="See data from apps and services you use related to your OnlineSaathi account."
                    icon={Eye}
                />
            </div>
        </div>
    );
};

export default Privacy;
