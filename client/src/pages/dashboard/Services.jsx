import { useNavigate } from 'react-router-dom';

// ─── Service data ─────────────────────────────────────────────────────────────
const REMITTANCE_SERVICES = [
    {
        id: 'ime',
        name: 'IME',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/IME_Logo.svg/200px-IME_Logo.svg.png',
        fallback: 'IME',
        color: '#cc0000',
        route: '/dashboard/services/ime',
        available: true,
    },
    {
        id: 'prabhu',
        name: 'Prabhu Money Transfer',
        logo: 'https://www.prabhupay.com/assets/img/logo.png',
        fallback: 'Prabhu',
        color: '#003087',
        route: null,
        available: false,
    },
];

const TOPUP_SERVICES = [
    { id: 'ncell',      name: 'Ncell',         color: '#6d0099', available: false },
    { id: 'ntc',        name: 'NTC PREPAID',   color: '#004080', available: false },
    { id: 'dishhome',   name: 'Dish Home',     color: '#e60000', available: false },
    { id: 'ntcdata',    name: 'NTC Data',      color: '#004080', available: false },
    { id: 'ncelldata',  name: 'NCELL Data',    color: '#6d0099', available: false },
    { id: 'nea',        name: 'NEA',           color: '#006600', available: false },
    { id: 'khanepani',  name: 'KhanePani',     color: '#0066cc', available: false },
    { id: 'vianet',     name: 'Vianet',        color: '#0057a8', available: false },
    { id: 'subisu',     name: 'Subisu',        color: '#003399', available: false },
    { id: 'arrownet',   name: 'ArrowNet',      color: '#ff6600', available: false },
    { id: 'worldlink',  name: 'Worldlink',     color: '#005b96', available: false },
    { id: 'techminds',  name: 'TechMinds',     color: '#1a6bb5', available: false },
    { id: 'wifinepal',  name: 'WIFI Nepal',    color: '#e63300', available: false },
    { id: 'websurfer',  name: 'Web Surfer',    color: '#336699', available: false },
    { id: 'palsnet',    name: 'Palsnet',       color: '#cc3300', available: false },
    { id: 'sky',        name: 'SKY Internet',  color: '#0066ff', available: false },
];

// ─── ServiceCard ──────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onClick }) => (
    <button
        onClick={() => service.available && onClick(service)}
        className={`relative flex flex-col items-center justify-center bg-[#f5f0e8] rounded-2xl p-4 gap-2 border-2 transition-all
            ${service.available
                ? 'border-teal-400 hover:shadow-lg hover:scale-105 cursor-pointer'
                : 'border-[#e8e0d0] cursor-not-allowed opacity-70'}`}
        style={{ minHeight: 110 }}
        title={!service.available ? 'Coming soon' : service.name}
    >
        {!service.available && (
            <span className="absolute top-1 right-2 text-[10px] text-gray-400 font-medium">Soon</span>
        )}
        {service.logo ? (
            <img
                src={service.logo}
                alt={service.name}
                className="h-12 object-contain"
                onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        ) : null}
        <span
            className="h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: service.color, display: service.logo ? 'none' : 'flex' }}
        >
            {(service.fallback || service.name).slice(0, 3)}
        </span>
        <span className="text-xs font-semibold text-center text-gray-700 leading-tight">{service.name}</span>
    </button>
);

// ─── Services Page ────────────────────────────────────────────────────────────
const Services = () => {
    const navigate = useNavigate();

    const handleClick = (service) => {
        if (service.route) navigate(service.route);
    };

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">

            {/* Indo-Nepal Money Transfer */}
            <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Indo-Nepal Money Transfer
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {REMITTANCE_SERVICES.map(s => (
                        <ServiceCard key={s.id} service={s} onClick={handleClick} />
                    ))}
                </div>
            </section>

            {/* Topup and Bill Payments */}
            <section className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Topup and Bill Payments
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {TOPUP_SERVICES.map(s => (
                        <ServiceCard key={s.id} service={s} onClick={handleClick} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Services;
