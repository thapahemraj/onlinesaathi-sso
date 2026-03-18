import { useState } from 'react';
import axios from 'axios';
import { Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }) => (
    <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h2>
        {children}
    </section>
);

const Input = (props) => (
    <input
        {...props}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-[#2a2a2a] dark:text-white"
    />
);

const TextArea = (props) => (
    <textarea
        {...props}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-[#2a2a2a] dark:text-white"
    />
);

const pretty = (value) => {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

const PrabhuPage = () => {
    const navigate = useNavigate();

    const [loadingKey, setLoadingKey] = useState('');
    const [result, setResult] = useState(null);

    const [customer, setCustomer] = useState({
        name: '',
        gender: '',
        dob: '',
        address: '',
        mobile: '',
        state: '',
        district: '',
        city: '',
        nationality: '',
        email: '',
        employer: '',
        idType: '',
        idNumber: '',
        idExpiryDate: '',
        idIssuedPlace: '',
        incomeSource: '',
        otpProcessId: '',
        otp: '',
        customerType: '',
        sourceIncomeType: ''
    });
    const [receiver, setReceiver] = useState({
        customerId: '',
        name: '',
        gender: '',
        mobile: '',
        relationship: '',
        address: '',
        paymentMode: '',
        bankBranchId: '',
        accountNumber: '',
        otpProcessId: '',
        otp: ''
    });
    const [otp, setOtp] = useState({
        operation: '',
        mobile: '',
        customerId: '',
        receiverId: '',
        receiverName: '',
        pinNo: '',
        paymentMode: '',
        bankBranchId: '',
        accountNumber: '',
        customerFullName: '',
        customerDOB: '',
        customerIdNumber: '',
        cspMobile: '',
        cspName: '',
        sendAmount: ''
    });
    const [txn, setTxn] = useState({
        customerId: '',
        senderName: '',
        senderGender: '',
        senderDoB: '',
        senderAddress: '',
        senderPhone: '',
        senderMobile: '',
        senderCity: '',
        senderDistrict: '',
        senderState: '',
        senderNationality: '',
        employer: '',
        senderIDType: '',
        senderIDNumber: '',
        senderIDExpiryDate: '',
        senderIDIssuedPlace: '',
        receiverId: '',
        receiverName: '',
        receiverGender: '',
        receiverAddress: '',
        receiverMobile: '',
        receiverRelationship: '',
        paymentMode: '',
        bankBranchId: '',
        accountNumber: '',
        country: '',
        transferAmount: '',
        serviceCharge: '',
        exchangeRate: '',
        payoutAmount: '',
        otpProcessId: '',
        otp: ''
    });
    const [verify, setVerify] = useState({ pinNo: '' });
    const [searchTxn, setSearchTxn] = useState({ pinNo: '', partnerPinNo: '', fromDate: '', toDate: '' });
    const [cancelTxn, setCancelTxn] = useState({ pinNo: '', reasonForCancellation: '', otpProcessId: '', otp: '' });
    const [customerLookup, setCustomerLookup] = useState({ customer_IdNo: '', customer_Mobile: '' });

    const runCall = async (key, method, url, body = undefined) => {
        setLoadingKey(key);
        try {
            const res = await axios({ method, url, data: body, withCredentials: true });
            setResult({ ok: true, status: res.status, url, method: method.toUpperCase(), data: res.data });
        } catch (error) {
            setResult({
                ok: false,
                status: error?.response?.status || 500,
                url,
                method: method.toUpperCase(),
                data: error?.response?.data || { message: error.message }
            });
        } finally {
            setLoadingKey('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold dark:text-white">Prabhu Form Flow (User Side)</h1>
                <button
                    onClick={() => navigate('/dashboard/services')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    <Home size={14} /> Home
                </button>
            </div>

            <Section title="1) Customer Lookup (Doc Path Params)">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="customer_IdNo" value={customerLookup.customer_IdNo} onChange={(e) => setCustomerLookup((p) => ({ ...p, customer_IdNo: e.target.value }))} />
                    <Input placeholder="customer_Mobile" value={customerLookup.customer_Mobile} onChange={(e) => setCustomerLookup((p) => ({ ...p, customer_Mobile: e.target.value }))} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => runCall('getByIdNo', 'get', `/Prabhu/GetCustomerByIdNumber/${customerLookup.customer_IdNo}`)}
                        className="px-4 py-2 rounded-md bg-gray-700 text-white text-sm font-medium"
                        disabled={loadingKey === 'getByIdNo' || !customerLookup.customer_IdNo}
                    >
                        {loadingKey === 'getByIdNo' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                        Get By ID No
                    </button>
                    <button
                        onClick={() => runCall('getByMobile', 'get', `/Prabhu/GetCustomerByMobile/${customerLookup.customer_Mobile}`)}
                        className="px-4 py-2 rounded-md bg-gray-700 text-white text-sm font-medium"
                        disabled={loadingKey === 'getByMobile' || !customerLookup.customer_Mobile}
                    >
                        {loadingKey === 'getByMobile' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                        Get By Mobile
                    </button>
                </div>
            </Section>

            <Section title="2) Create Customer (Create_Customer_Request)">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input placeholder="name" value={customer.name} onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))} />
                    <Input placeholder="gender" value={customer.gender} onChange={(e) => setCustomer((p) => ({ ...p, gender: e.target.value }))} />
                    <Input placeholder="dob (YYYY-MM-DD)" value={customer.dob} onChange={(e) => setCustomer((p) => ({ ...p, dob: e.target.value }))} />
                    <Input placeholder="address" value={customer.address} onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))} />
                    <Input placeholder="mobile" value={customer.mobile} onChange={(e) => setCustomer((p) => ({ ...p, mobile: e.target.value }))} />
                    <Input placeholder="state" value={customer.state} onChange={(e) => setCustomer((p) => ({ ...p, state: e.target.value }))} />
                    <Input placeholder="district" value={customer.district} onChange={(e) => setCustomer((p) => ({ ...p, district: e.target.value }))} />
                    <Input placeholder="city" value={customer.city} onChange={(e) => setCustomer((p) => ({ ...p, city: e.target.value }))} />
                    <Input placeholder="nationality" value={customer.nationality} onChange={(e) => setCustomer((p) => ({ ...p, nationality: e.target.value }))} />
                    <Input placeholder="email" value={customer.email} onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))} />
                    <Input placeholder="employer" value={customer.employer} onChange={(e) => setCustomer((p) => ({ ...p, employer: e.target.value }))} />
                    <Input placeholder="idType" value={customer.idType} onChange={(e) => setCustomer((p) => ({ ...p, idType: e.target.value }))} />
                    <Input placeholder="idNumber" value={customer.idNumber} onChange={(e) => setCustomer((p) => ({ ...p, idNumber: e.target.value }))} />
                    <Input placeholder="idExpiryDate" value={customer.idExpiryDate} onChange={(e) => setCustomer((p) => ({ ...p, idExpiryDate: e.target.value }))} />
                    <Input placeholder="idIssuedPlace" value={customer.idIssuedPlace} onChange={(e) => setCustomer((p) => ({ ...p, idIssuedPlace: e.target.value }))} />
                    <Input placeholder="incomeSource" value={customer.incomeSource} onChange={(e) => setCustomer((p) => ({ ...p, incomeSource: e.target.value }))} />
                    <Input placeholder="otpProcessId" value={customer.otpProcessId} onChange={(e) => setCustomer((p) => ({ ...p, otpProcessId: e.target.value }))} />
                    <Input placeholder="otp" value={customer.otp} onChange={(e) => setCustomer((p) => ({ ...p, otp: e.target.value }))} />
                    <Input placeholder="customerType" value={customer.customerType} onChange={(e) => setCustomer((p) => ({ ...p, customerType: e.target.value }))} />
                    <Input placeholder="sourceIncomeType" value={customer.sourceIncomeType} onChange={(e) => setCustomer((p) => ({ ...p, sourceIncomeType: e.target.value }))} />
                </div>
                <button
                    onClick={() => runCall('createCustomer', 'post', '/Prabhu/CreateCustomer', customer)}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'createCustomer'}
                >
                    {loadingKey === 'createCustomer' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Submit Customer
                </button>
            </Section>

            <Section title="3) Create Receiver (Create_Receiver_Request)">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input placeholder="customerId" value={receiver.customerId} onChange={(e) => setReceiver((p) => ({ ...p, customerId: e.target.value }))} />
                    <Input placeholder="name" value={receiver.name} onChange={(e) => setReceiver((p) => ({ ...p, name: e.target.value }))} />
                    <Input placeholder="gender" value={receiver.gender} onChange={(e) => setReceiver((p) => ({ ...p, gender: e.target.value }))} />
                    <Input placeholder="mobile" value={receiver.mobile} onChange={(e) => setReceiver((p) => ({ ...p, mobile: e.target.value }))} />
                    <Input placeholder="relationship" value={receiver.relationship} onChange={(e) => setReceiver((p) => ({ ...p, relationship: e.target.value }))} />
                    <Input placeholder="address" value={receiver.address} onChange={(e) => setReceiver((p) => ({ ...p, address: e.target.value }))} />
                    <Input placeholder="paymentMode" value={receiver.paymentMode} onChange={(e) => setReceiver((p) => ({ ...p, paymentMode: e.target.value }))} />
                    <Input placeholder="bankBranchId" value={receiver.bankBranchId} onChange={(e) => setReceiver((p) => ({ ...p, bankBranchId: e.target.value }))} />
                    <Input placeholder="accountNumber" value={receiver.accountNumber} onChange={(e) => setReceiver((p) => ({ ...p, accountNumber: e.target.value }))} />
                    <Input placeholder="otpProcessId" value={receiver.otpProcessId} onChange={(e) => setReceiver((p) => ({ ...p, otpProcessId: e.target.value }))} />
                    <Input placeholder="otp" value={receiver.otp} onChange={(e) => setReceiver((p) => ({ ...p, otp: e.target.value }))} />
                </div>
                <button
                    onClick={() => runCall('createReceiver', 'post', '/Prabhu/CreateReceiver', receiver)}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'createReceiver'}
                >
                    {loadingKey === 'createReceiver' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Submit Receiver
                </button>
            </Section>

            <Section title="4) Send OTP (Send_OTP_Request)">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input placeholder="operation" value={otp.operation} onChange={(e) => setOtp((p) => ({ ...p, operation: e.target.value }))} />
                    <Input placeholder="mobile" value={otp.mobile} onChange={(e) => setOtp((p) => ({ ...p, mobile: e.target.value }))} />
                    <Input placeholder="customerId" value={otp.customerId} onChange={(e) => setOtp((p) => ({ ...p, customerId: e.target.value }))} />
                    <Input placeholder="receiverId" value={otp.receiverId} onChange={(e) => setOtp((p) => ({ ...p, receiverId: e.target.value }))} />
                    <Input placeholder="receiverName" value={otp.receiverName} onChange={(e) => setOtp((p) => ({ ...p, receiverName: e.target.value }))} />
                    <Input placeholder="pinNo" value={otp.pinNo} onChange={(e) => setOtp((p) => ({ ...p, pinNo: e.target.value }))} />
                    <Input placeholder="paymentMode" value={otp.paymentMode} onChange={(e) => setOtp((p) => ({ ...p, paymentMode: e.target.value }))} />
                    <Input placeholder="bankBranchId" value={otp.bankBranchId} onChange={(e) => setOtp((p) => ({ ...p, bankBranchId: e.target.value }))} />
                    <Input placeholder="accountNumber" value={otp.accountNumber} onChange={(e) => setOtp((p) => ({ ...p, accountNumber: e.target.value }))} />
                    <Input placeholder="customerFullName" value={otp.customerFullName} onChange={(e) => setOtp((p) => ({ ...p, customerFullName: e.target.value }))} />
                    <Input placeholder="customerDOB" value={otp.customerDOB} onChange={(e) => setOtp((p) => ({ ...p, customerDOB: e.target.value }))} />
                    <Input placeholder="customerIdNumber" value={otp.customerIdNumber} onChange={(e) => setOtp((p) => ({ ...p, customerIdNumber: e.target.value }))} />
                    <Input placeholder="cspMobile" value={otp.cspMobile} onChange={(e) => setOtp((p) => ({ ...p, cspMobile: e.target.value }))} />
                    <Input placeholder="cspName" value={otp.cspName} onChange={(e) => setOtp((p) => ({ ...p, cspName: e.target.value }))} />
                    <Input placeholder="sendAmount" value={otp.sendAmount} onChange={(e) => setOtp((p) => ({ ...p, sendAmount: e.target.value }))} />
                </div>
                <button
                    onClick={() => runCall('sendOtp', 'post', '/Prabhu/SendOTP', otp)}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'sendOtp'}
                >
                    {loadingKey === 'sendOtp' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Send OTP
                </button>
            </Section>

            <Section title="5) Send Transaction (Send_Transaction_Request)">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input placeholder="customerId" value={txn.customerId} onChange={(e) => setTxn((p) => ({ ...p, customerId: e.target.value }))} />
                    <Input placeholder="senderName" value={txn.senderName} onChange={(e) => setTxn((p) => ({ ...p, senderName: e.target.value }))} />
                    <Input placeholder="senderGender" value={txn.senderGender} onChange={(e) => setTxn((p) => ({ ...p, senderGender: e.target.value }))} />
                    <Input placeholder="senderDoB" value={txn.senderDoB} onChange={(e) => setTxn((p) => ({ ...p, senderDoB: e.target.value }))} />
                    <Input placeholder="senderAddress" value={txn.senderAddress} onChange={(e) => setTxn((p) => ({ ...p, senderAddress: e.target.value }))} />
                    <Input placeholder="senderPhone" value={txn.senderPhone} onChange={(e) => setTxn((p) => ({ ...p, senderPhone: e.target.value }))} />
                    <Input placeholder="senderMobile" value={txn.senderMobile} onChange={(e) => setTxn((p) => ({ ...p, senderMobile: e.target.value }))} />
                    <Input placeholder="senderCity" value={txn.senderCity} onChange={(e) => setTxn((p) => ({ ...p, senderCity: e.target.value }))} />
                    <Input placeholder="senderDistrict" value={txn.senderDistrict} onChange={(e) => setTxn((p) => ({ ...p, senderDistrict: e.target.value }))} />
                    <Input placeholder="senderState" value={txn.senderState} onChange={(e) => setTxn((p) => ({ ...p, senderState: e.target.value }))} />
                    <Input placeholder="senderNationality" value={txn.senderNationality} onChange={(e) => setTxn((p) => ({ ...p, senderNationality: e.target.value }))} />
                    <Input placeholder="employer" value={txn.employer} onChange={(e) => setTxn((p) => ({ ...p, employer: e.target.value }))} />
                    <Input placeholder="senderIDType" value={txn.senderIDType} onChange={(e) => setTxn((p) => ({ ...p, senderIDType: e.target.value }))} />
                    <Input placeholder="senderIDNumber" value={txn.senderIDNumber} onChange={(e) => setTxn((p) => ({ ...p, senderIDNumber: e.target.value }))} />
                    <Input placeholder="senderIDExpiryDate" value={txn.senderIDExpiryDate} onChange={(e) => setTxn((p) => ({ ...p, senderIDExpiryDate: e.target.value }))} />
                    <Input placeholder="senderIDIssuedPlace" value={txn.senderIDIssuedPlace} onChange={(e) => setTxn((p) => ({ ...p, senderIDIssuedPlace: e.target.value }))} />
                    <Input placeholder="receiverId" value={txn.receiverId} onChange={(e) => setTxn((p) => ({ ...p, receiverId: e.target.value }))} />
                    <Input placeholder="receiverName" value={txn.receiverName} onChange={(e) => setTxn((p) => ({ ...p, receiverName: e.target.value }))} />
                    <Input placeholder="receiverGender" value={txn.receiverGender} onChange={(e) => setTxn((p) => ({ ...p, receiverGender: e.target.value }))} />
                    <Input placeholder="receiverAddress" value={txn.receiverAddress} onChange={(e) => setTxn((p) => ({ ...p, receiverAddress: e.target.value }))} />
                    <Input placeholder="receiverMobile" value={txn.receiverMobile} onChange={(e) => setTxn((p) => ({ ...p, receiverMobile: e.target.value }))} />
                    <Input placeholder="receiverRelationship" value={txn.receiverRelationship} onChange={(e) => setTxn((p) => ({ ...p, receiverRelationship: e.target.value }))} />
                    <Input placeholder="paymentMode" value={txn.paymentMode} onChange={(e) => setTxn((p) => ({ ...p, paymentMode: e.target.value }))} />
                    <Input placeholder="bankBranchId" value={txn.bankBranchId} onChange={(e) => setTxn((p) => ({ ...p, bankBranchId: e.target.value }))} />
                    <Input placeholder="accountNumber" value={txn.accountNumber} onChange={(e) => setTxn((p) => ({ ...p, accountNumber: e.target.value }))} />
                    <Input placeholder="country" value={txn.country} onChange={(e) => setTxn((p) => ({ ...p, country: e.target.value }))} />
                    <Input placeholder="transferAmount" value={txn.transferAmount} onChange={(e) => setTxn((p) => ({ ...p, transferAmount: e.target.value }))} />
                    <Input placeholder="serviceCharge" value={txn.serviceCharge} onChange={(e) => setTxn((p) => ({ ...p, serviceCharge: e.target.value }))} />
                    <Input placeholder="exchangeRate" value={txn.exchangeRate} onChange={(e) => setTxn((p) => ({ ...p, exchangeRate: e.target.value }))} />
                    <Input placeholder="payoutAmount" value={txn.payoutAmount} onChange={(e) => setTxn((p) => ({ ...p, payoutAmount: e.target.value }))} />
                    <Input placeholder="otpProcessId" value={txn.otpProcessId} onChange={(e) => setTxn((p) => ({ ...p, otpProcessId: e.target.value }))} />
                    <Input placeholder="otp" value={txn.otp} onChange={(e) => setTxn((p) => ({ ...p, otp: e.target.value }))} />
                </div>
                <button
                    onClick={() => runCall('sendTxn', 'post', '/Prabhu/SendTransaction', txn)}
                    className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'sendTxn'}
                >
                    {loadingKey === 'sendTxn' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Send Transaction
                </button>
            </Section>

            <Section title="6) Search / Cancel / Verify Transaction">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Pin Number" value={verify.pinNo} onChange={(e) => setVerify({ pinNo: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input placeholder="search pinNo" value={searchTxn.pinNo} onChange={(e) => setSearchTxn((p) => ({ ...p, pinNo: e.target.value }))} />
                    <Input placeholder="partnerPinNo" value={searchTxn.partnerPinNo} onChange={(e) => setSearchTxn((p) => ({ ...p, partnerPinNo: e.target.value }))} />
                    <Input placeholder="fromDate" value={searchTxn.fromDate} onChange={(e) => setSearchTxn((p) => ({ ...p, fromDate: e.target.value }))} />
                    <Input placeholder="toDate" value={searchTxn.toDate} onChange={(e) => setSearchTxn((p) => ({ ...p, toDate: e.target.value }))} />
                    <Input placeholder="cancel pinNo" value={cancelTxn.pinNo} onChange={(e) => setCancelTxn((p) => ({ ...p, pinNo: e.target.value }))} />
                    <Input placeholder="reasonForCancellation" value={cancelTxn.reasonForCancellation} onChange={(e) => setCancelTxn((p) => ({ ...p, reasonForCancellation: e.target.value }))} />
                    <Input placeholder="cancel otpProcessId" value={cancelTxn.otpProcessId} onChange={(e) => setCancelTxn((p) => ({ ...p, otpProcessId: e.target.value }))} />
                    <Input placeholder="cancel otp" value={cancelTxn.otp} onChange={(e) => setCancelTxn((p) => ({ ...p, otp: e.target.value }))} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => runCall('searchTxn', 'post', '/Prabhu/SearchTransaction', searchTxn)}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
                        disabled={loadingKey === 'searchTxn'}
                    >
                        {loadingKey === 'searchTxn' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                        Search
                    </button>
                    <button
                        onClick={() => runCall('cancelTxn', 'post', '/Prabhu/CancelTransaction', cancelTxn)}
                        className="px-4 py-2 rounded-md bg-amber-600 text-white text-sm font-medium"
                        disabled={loadingKey === 'cancelTxn'}
                    >
                        {loadingKey === 'cancelTxn' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                        Cancel
                    </button>
                    <button
                        onClick={() => runCall('verifyTxn', 'post', `/Prabhu/VerifyTransaction/${verify.pinNo}`, {})}
                        className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium"
                        disabled={loadingKey === 'verifyTxn' || !verify.pinNo}
                    >
                        {loadingKey === 'verifyTxn' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                        Verify
                    </button>
                </div>
            </Section>

            <Section title="Latest API Response">
                {!result ? (
                    <p className="text-sm text-gray-500">Form submit karne ke baad response yahan dikhega.</p>
                ) : (
                    <div className={`rounded-lg p-3 text-sm ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {result.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span className="font-semibold">{result.method} {result.url}</span>
                            <span className="ml-auto">HTTP {result.status}</span>
                        </div>
                        <TextArea rows={12} value={pretty(result.data)} readOnly />
                    </div>
                )}
            </Section>
        </div>
    );
};

export default PrabhuPage;
