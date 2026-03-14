import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

const transactions = [
    { id: 1, type: 'Credit', title: 'District partner settlement', amount: 12500, date: '13 Mar 2026, 10:20 AM', channel: 'UPI Batch' },
    { id: 2, type: 'Debit', title: 'Saathi payout release', amount: 8400, date: '13 Mar 2026, 08:55 AM', channel: 'Bank Transfer' },
    { id: 3, type: 'Credit', title: 'Service fee collection', amount: 3250, date: '12 Mar 2026, 06:10 PM', channel: 'Wallet Ledger' },
    { id: 4, type: 'Debit', title: 'Refund adjustment', amount: 2100, date: '12 Mar 2026, 02:35 PM', channel: 'Manual Adjustment' },
];

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
}).format(value);

export default function WalletHistory() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Wallet History</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review recent credit and debit activity across admin wallet flows.</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#2c2c2c]">
                <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                    <History size={16} className="text-[#0078D4] dark:text-[#4f93ce]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200">Recent Transactions</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-[#232323]">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                <th className="px-5 py-3 font-semibold">Type</th>
                                <th className="px-5 py-3 font-semibold">Description</th>
                                <th className="px-5 py-3 font-semibold">Channel</th>
                                <th className="px-5 py-3 font-semibold">Date</th>
                                <th className="px-5 py-3 font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {transactions.map((item) => {
                                const isCredit = item.type === 'Credit';
                                const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;

                                return (
                                    <tr key={item.id}>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isCredit
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                            }`}>
                                                <Icon size={14} />
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{item.title}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.channel}</td>
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.date}</td>
                                        <td className={`px-5 py-4 font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                            {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}