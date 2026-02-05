const PaymentOptions = () => (
    <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-[#323130] mb-6">Payment options</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold mb-1">Payment methods</h2>
                <p className="text-gray-500 text-sm">Manage how you pay for purchases.</p>
            </div>
            <button className="text-[#0067b8] hover:underline font-semibold text-sm">Add a new payment method</button>
        </div>
    </div>
);
export default PaymentOptions;
