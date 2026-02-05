import { Building } from 'lucide-react';

const Organizations = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-blue-50 p-6 rounded-full mb-4">
                <Building size={48} className="text-[#0078D4]" />
            </div>
            <h2 className="text-2xl font-bold text-[#323130] mb-2">Organizations Management</h2>
            <p className="text-gray-500 max-w-md">
                Manage your multi-tenant organizations here. This feature is currently under development.
            </p>
            <button className="mt-6 bg-[#0078D4] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#005a9e] transition-colors">
                Create Organization
            </button>
        </div>
    );
};

export default Organizations;
