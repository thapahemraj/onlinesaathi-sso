import { Package, Bell } from 'lucide-react';

const Subscriptions = () => {
    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-[#323130] dark:text-white mb-8">Subscriptions</h1>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <div className="text-center py-8">
                    <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                        <Package size={36} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#323130] dark:text-white mb-2">No active subscriptions</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
                        You don't have any active subscriptions. When you subscribe to OnlineSaathi services, your subscriptions will appear here.
                    </p>
                    <button className="bg-[#0067b8] text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-[#005da6] transition-colors">
                        View all subscriptions
                    </button>
                </div>
            </div>

            <div className="mt-6 bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Bell size={20} className="text-[#0078D4] dark:text-[#4f93ce]" />
                    <h3 className="font-semibold text-[#323130] dark:text-white">Subscription preferences</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage how you receive notifications about your subscriptions.</p>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#0067b8]" />
                        Email notifications
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#0067b8]" />
                        Renewal reminders
                    </label>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
