import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
    // Steps: 1=Email, 2=Password, 3=Name, 4=Details(Country/DOB), 5=Verify(OTP)
    const [step, setStep] = useState(1);
    const location = useLocation();

    // Form State - Pre-fill email if passed from Login Page
    const [email, setEmail] = useState(location.state?.email || '');
    // If email was passed, we could optionally auto-advance to step 2, 
    // but usually users expect to confirm their email first in the "Create account" step.
    // For now we just pre-fill it.
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState('India'); // Default or auto-detect
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [otp, setOtp] = useState('');

    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleNext = (e) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
                setError('Please enter a valid email address.');
                return;
            }
            setStep(2);
        }
        else if (step === 2) {
            if (!password || password.length < 8) {
                setError('Password must be at least 8 characters.');
                return;
            }
            setStep(3);
        }
        else if (step === 3) {
            if (!firstName || !lastName) {
                setError('Please enter your first and last name.');
                return;
            }
            setStep(4);
        }
        else if (step === 4) {
            if (!birthDay || !birthMonth || !birthYear) {
                setError('Please enter your birthdate.');
                return;
            }
            // In a real app, trigger email send here
            console.log("Sending OTP to", email);
            setStep(5);
        }
        // Step 5 is handled by handleSubmit
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length < 4) {
            setError('Please enter the code sent to your email.');
            return;
        }

        // Mock OTP check
        // In real app: await verifyOtp(email, otp)

        try {
            // Combine names for the simple backend 'username' field
            const fullName = `${firstName} ${lastName}`;
            await register(fullName, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    // Input classes for consistency
    const inputClasses = "w-full h-9 px-3 border border-[#868686] rounded-md hover:border-[#323130] focus:border-[#0067b8] focus:border-2 outline-none text-[15px] placeholder-gray-500 transition-colors";
    const buttonClasses = "w-full bg-[#0067b8] text-white py-2 hover:bg-[#005da6] shadow-sm rounded-md text-[15px] font-semibold transition-colors mt-4";

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-[#f0f2f5]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 hidden md:block"
                style={{
                    backgroundImage: "url('https://aadcdn.msauth.net/shared/1.0/content/images/backgrounds/4_eae2dd7eb3a55636dc2d74f4fa4c386e.svg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
            </div>

            {/* Card */}
            <div className="z-10 w-full max-w-[440px] bg-white shadow-xl p-11 rounded-xl transition-all duration-300">
                <div className="w-full">

                    {/* Header Logo */}
                    <div className="mb-8 flex justify-center">
                        <img src="https://aadcdn.msauth.net/shared/1.0/content/images/microsoft_logo_564db913a7fa0ca42727161c6d031bef.svg" alt="Microsoft" className="h-6" />
                    </div>

                    {/* --- STEP 1: EMAIL --- */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-6 leading-tight">Create account</h2>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-6">
                                    <input
                                        type="email"
                                        className={inputClasses}
                                        placeholder="someone@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <button type="button" className="text-[#0067b8] text-[13px] hover:underline hover:text-[#005da6]">Get a new email address</button>
                                </div>
                                <div className="mb-8">
                                    <span className="text-[13px] text-[#1b1b1b]">
                                        Already have an account? <Link to="/login" className="text-[#0067b8] hover:underline">Sign in</Link>
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 2: PASSWORD --- */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 rounded-full -ml-2 mb-2 transition-colors">
                                <ArrowLeft size={20} className="text-[#646464]" />
                                <span className="text-sm">{email}</span>
                            </button>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight">Create a password</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b]">Enter the password you would like to use with your account.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-4">
                                    <input
                                        type="password"
                                        className={inputClasses}
                                        placeholder="Create password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-8 flex items-center">
                                    <input type="checkbox" className="mr-2 w-4 h-4 border-gray-400 rounded-none focus:ring-[#0067b8]" id="showPass" />
                                    <label htmlFor="showPass" className="text-[13px] text-[#1b1b1b]">Show password</label>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 3: NAME --- */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 rounded-full -ml-2 mb-2 transition-colors">
                                <ArrowLeft size={20} className="text-[#646464]" />
                                <span className="text-sm">{email}</span>
                            </button>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight">What's your name?</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b]">We need a little more info before we're done.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-6 space-y-4">
                                    <input
                                        type="text"
                                        className={inputClasses}
                                        placeholder="First name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        className={inputClasses}
                                        placeholder="Last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 4: DETAILS (Country/DOB) --- */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 rounded-full -ml-2 mb-2 transition-colors">
                                <ArrowLeft size={20} className="text-[#646464]" />
                                <span className="text-sm">{email}</span>
                            </button>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight">What's your birthdate?</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b]">We need this to ensure the account is age-appropriate.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-[#1b1b1b] mb-1">Country/region</label>
                                    <select
                                        className={`${inputClasses} bg-transparent py-0`}
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    >
                                        <option value="India">India</option>
                                        <option value="United States">United States</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Nepal">Nepal</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-[#1b1b1b] mb-1">Birthdate</label>
                                    <div className="flex gap-2">
                                        <select
                                            className={`${inputClasses} bg-transparent py-0 w-1/2`}
                                            value={birthMonth}
                                            onChange={(e) => setBirthMonth(e.target.value)}
                                        >
                                            <option value="" disabled>Month</option>
                                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        <select
                                            className={`${inputClasses} bg-transparent py-0 w-1/4`}
                                            value={birthDay}
                                            onChange={(e) => setBirthDay(e.target.value)}
                                        >
                                            <option value="" disabled>Day</option>
                                            {[...Array(31)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                        <select
                                            className={`${inputClasses} bg-transparent py-0 w-1/3`}
                                            value={birthYear}
                                            onChange={(e) => setBirthYear(e.target.value)}
                                        >
                                            <option value="" disabled>Year</option>
                                            {[...Array(100)].map((_, i) => (
                                                <option key={i} value={2024 - i}>{2024 - i}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 5: VERIFY (OTP) --- */}
                    {step === 5 && (
                        <div className="animate-fade-in">
                            <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 rounded-full -ml-2 mb-2 transition-colors">
                                <ArrowLeft size={20} className="text-[#646464]" />
                                <span className="text-sm">{email}</span>
                            </button>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight">Verify email</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b]">
                                Enter the code we sent to <span className="font-semibold">{email}</span>.
                                <br />If you didn't receive the email, check your junk folder or <button className="text-[#0067b8] hover:underline">try again</button>.
                            </p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    {/* Simple Mock for 4-digit input */}
                                    {/* Visually simulated as distinct box */}
                                    <input
                                        type="text"
                                        className="w-[120px] h-10 px-3 border border-[#868686] rounded-[2px] hover:border-[#323130] focus:border-[#0067b8] focus:border-2 outline-none text-[15px] text-center tracking-widest placeholder-gray-500"
                                        placeholder="Code"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4 flex items-start gap-2">
                                    <input type="checkbox" id="info" defaultChecked className="mt-1 w-4 h-4 border-gray-400 rounded-none" />
                                    <label htmlFor="info" className="text-[13px] text-[#1b1b1b]">I would like information, tips, and offers about Microsoft products and services.</label>
                                </div>

                                <div className="flex justify-end mt-8">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 w-full z-10 hidden md:flex justify-end px-4 py-2 text-xs text-black/60 gap-4">
                <span className="hover:underline cursor-pointer">Terms of use</span>
                <span className="hover:underline cursor-pointer">Privacy & cookies</span>
                <span className="hover:underline cursor-pointer">...</span>
            </div>
        </div>
    );
};

export default RegisterPage;
