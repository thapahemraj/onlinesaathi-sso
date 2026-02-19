import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Overview from './dashboard/Overview';
import YourInfo from './dashboard/YourInfo';
import Devices from './dashboard/Devices';
import Sessions from './dashboard/Sessions';
import Security from './dashboard/Security';
import Privacy from './dashboard/Privacy';
import Subscriptions from './dashboard/Subscriptions';
import PaymentOptions from './dashboard/PaymentOptions';
import OrderHistory from './dashboard/OrderHistory';
import AddressBook from './dashboard/AddressBook';

const Dashboard = () => {
    return (
        <DashboardLayout>
            <Routes>
                <Route index element={<Overview />} />
                <Route path="info" element={<YourInfo />} />
                <Route path="devices" element={<Devices />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="security" element={<Security />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="payment" element={<PaymentOptions />} />
                <Route path="orders" element={<OrderHistory />} />
                <Route path="addresses" element={<AddressBook />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default Dashboard;

