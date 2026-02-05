const AddressBook = () => (
    <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-[#323130] mb-6">Address book</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold mb-1">Billing & shipping addresses</h2>
                    <p className="text-gray-500 text-sm">Manage your addresses for billing and shipping.</p>
                </div>
                <button className="text-[#0067b8] hover:underline font-semibold text-sm">Add a new address</button>
            </div>
        </div>
    </div>
);
export default AddressBook;
