import { ShoppingBag, Filter } from 'lucide-react';
import { useState } from 'react';

const OrderHistory = () => {
    const [timeRange, setTimeRange] = useState('3');

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-[#323130] dark:text-white">Order history</h1>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                    <select
                        value={timeRange}
                        onChange={e => setTimeRange(e.target.value)}
                        className="h-9 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#3b3b3b] text-[#323130] dark:text-white text-sm focus:border-[#0067b8] focus:outline-none"
                    >
                        <option value="3">Last 3 months</option>
                        <option value="6">Last 6 months</option>
                        <option value="12">Last 12 months</option>
                        <option value="all">All time</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-[#2c2c2c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="text-center py-16">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No orders found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                        {timeRange === 'all' ? "You haven't placed any orders yet" : `No orders in the last ${timeRange} months`}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-4 max-w-md mx-auto">
                        When you purchase items from OnlineSaathi or connected services, your order history will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
