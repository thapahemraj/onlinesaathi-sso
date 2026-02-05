const OrderHistory = () => (
    <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-[#323130] mb-6">Order history</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-[#323130] mb-4">View your past purchases from the last 3 months.</p>
            <div className="border-t border-gray-200 pt-8 text-center text-gray-500">
                No orders found in the last 3 months.
            </div>
        </div>
    </div>
);
export default OrderHistory;
