import { useState } from 'react';
import axios from 'axios';
import { Home, Loader2 } from 'lucide-react';
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

const RemittanceAllPage = () => {
    const navigate = useNavigate();

    const [loadingKey, setLoadingKey] = useState('');
    const [response, setResponse] = useState(null);

    const [checkCustomer, setCheckCustomer] = useState({ mobileNo: '' });
    const [registerCustomer, setRegisterCustomer] = useState({ fullName: '', mobileNo: '', idNumber: '' });
    const [sendIme, setSendIme] = useState({ customerMobile: '', beneficiaryId: '', amount: '' });
    const [sendPrabhu, setSendPrabhu] = useState({ customerMobile: '', receiverMobile: '', amount: '' });
    const [lookup, setLookup] = useState({ pinNo: '', userId: '' });

    const callApi = async (key, method, url, body = undefined) => {
        setLoadingKey(key);
        try {
            const res = await axios({ method, url, data: body, withCredentials: true });
            setResponse({ ok: true, status: res.status, method: method.toUpperCase(), url, data: res.data });
        } catch (error) {
            setResponse({
                ok: false,
                status: error?.response?.status || 500,
                method: method.toUpperCase(),
                url,
                data: error?.response?.data || { message: error.message }
            });
        } finally {
            setLoadingKey('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6 px-4 space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold dark:text-white">Remittance User Form Flow</h1>
                <button
                    onClick={() => navigate('/dashboard/services')}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    <Home size={14} /> Home
                </button>
            </div>

            <Section title="1) Check Customer">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                        placeholder="Customer Mobile"
                        value={checkCustomer.mobileNo}
                        onChange={(e) => setCheckCustomer({ mobileNo: e.target.value })}
                    />
                </div>
                <button
                    onClick={() => callApi('checkCustomer', 'post', '/Remittance/CheckCustomer', checkCustomer)}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'checkCustomer'}
                >
                    {loadingKey === 'checkCustomer' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Check Customer
                </button>
            </Section>

            <Section title="2) Register Customer">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="Full Name" value={registerCustomer.fullName} onChange={(e) => setRegisterCustomer((p) => ({ ...p, fullName: e.target.value }))} />
                    <Input placeholder="Mobile No" value={registerCustomer.mobileNo} onChange={(e) => setRegisterCustomer((p) => ({ ...p, mobileNo: e.target.value }))} />
                    <Input placeholder="ID Number" value={registerCustomer.idNumber} onChange={(e) => setRegisterCustomer((p) => ({ ...p, idNumber: e.target.value }))} />
                </div>
                <button
                    onClick={() => callApi('registerCustomer', 'post', '/Remittance/RegisterCustomer', registerCustomer)}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'registerCustomer'}
                >
                    {loadingKey === 'registerCustomer' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Register Customer
                </button>
            </Section>

            <Section title="3) Send IME Transaction">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="Customer Mobile" value={sendIme.customerMobile} onChange={(e) => setSendIme((p) => ({ ...p, customerMobile: e.target.value }))} />
                    <Input placeholder="Beneficiary ID" value={sendIme.beneficiaryId} onChange={(e) => setSendIme((p) => ({ ...p, beneficiaryId: e.target.value }))} />
                    <Input type="number" placeholder="Amount" value={sendIme.amount} onChange={(e) => setSendIme((p) => ({ ...p, amount: e.target.value }))} />
                </div>
                <button
                    onClick={() => callApi('sendIme', 'post', '/Remittance/SendIMETransaction', { ...sendIme, amount: Number(sendIme.amount || 0) })}
                    className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'sendIme'}
                >
                    {loadingKey === 'sendIme' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Send IME
                </button>
            </Section>

            <Section title="4) Send Prabhu Transaction">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="Customer Mobile" value={sendPrabhu.customerMobile} onChange={(e) => setSendPrabhu((p) => ({ ...p, customerMobile: e.target.value }))} />
                    <Input placeholder="Receiver Mobile" value={sendPrabhu.receiverMobile} onChange={(e) => setSendPrabhu((p) => ({ ...p, receiverMobile: e.target.value }))} />
                    <Input type="number" placeholder="Amount" value={sendPrabhu.amount} onChange={(e) => setSendPrabhu((p) => ({ ...p, amount: e.target.value }))} />
                </div>
                <button
                    onClick={() => callApi('sendPrabhu', 'post', '/Remittance/SendPrabhuTransaction', { ...sendPrabhu, amount: Number(sendPrabhu.amount || 0) })}
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium"
                    disabled={loadingKey === 'sendPrabhu'}
                >
                    {loadingKey === 'sendPrabhu' ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
                    Send Prabhu
                </button>
            </Section>

            <Section title="5) Lookup / Tracking">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="PIN No" value={lookup.pinNo} onChange={(e) => setLookup((p) => ({ ...p, pinNo: e.target.value }))} />
                    <Input placeholder="User ID" value={lookup.userId} onChange={(e) => setLookup((p) => ({ ...p, userId: e.target.value }))} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => callApi('txnByPin', 'get', '/Remittance/GetTransactionByPinNo')}
                        className="px-4 py-2 rounded-md bg-gray-700 text-white text-sm font-medium"
                        disabled={loadingKey === 'txnByPin'}
                    >
                        Get By PIN
                    </button>
                    <button
                        onClick={() => callApi('imeByUser', 'get', `/Remittance/ime/${lookup.userId}`)}
                        className="px-4 py-2 rounded-md bg-gray-700 text-white text-sm font-medium"
                        disabled={loadingKey === 'imeByUser' || !lookup.userId}
                    >
                        IME by User
                    </button>
                    <button
                        onClick={() => callApi('prabhuByUser', 'get', `/Remittance/prabhu/${lookup.userId}`)}
                        className="px-4 py-2 rounded-md bg-gray-700 text-white text-sm font-medium"
                        disabled={loadingKey === 'prabhuByUser' || !lookup.userId}
                    >
                        Prabhu by User
                    </button>
                </div>
            </Section>

            <Section title="Latest API Response">
                {!response ? (
                    <p className="text-sm text-gray-500">Form submit karne ke baad response yahan dikhega.</p>
                ) : (
                    <>
                        <div className={`text-sm font-medium ${response.ok ? 'text-green-600' : 'text-red-600'}`}>
                            {response.method} {response.url} — HTTP {response.status}
                        </div>
                        <TextArea rows={14} value={pretty(response.data)} readOnly />
                    </>
                )}
            </Section>
        </div>
    );
};

export default RemittanceAllPage;
