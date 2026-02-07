import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from 'axios';
import CustomAlert from '../components/CustomAlert';
import MsInput from '../components/MsInput';

const RegisterPage = () => {
    // Steps: 1=Email, 2=Password, 3=Name, 4=Details(Country/DOB), 5=Verify(OTP)
    const [step, setStep] = useState(1);
    const location = useLocation();

    // Form State - Pre-fill email/phone if passed from Login Page
    const passedIdentifier = location.state?.email || '';
    const isPhone = /^[0-9+]+$/.test(passedIdentifier) && passedIdentifier.length > 3;

    const [email, setEmail] = useState(isPhone ? '' : passedIdentifier);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(isPhone ? passedIdentifier : '');
    const [usePhone, setUsePhone] = useState(isPhone);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState('India'); // Default or auto-detect
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

    const { register } = useAuth();
    const navigate = useNavigate();

    const showAlert = (message, type = 'success') => {
        setAlertConfig({ show: true, message, type });
        if (type !== 'loading') {
            setTimeout(() => setAlertConfig(prev => ({ ...prev, show: false })), 3000);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            if (usePhone) {
                // Basic validation for phone (e.g., must be 10 digits or start with +)
                // Assuming simple 10 digit or +91 format for now
                if (!phoneNumber || phoneNumber.length < 10) {
                    setError('Please enter a valid phone number.');
                    return;
                }
            } else {
                if (!email || !/\S+@\S+\.\S+/.test(email)) {
                    setError('Please enter a valid email address.');
                    return;
                }
            }
            // Check existence on backend
            axios.post(`${import.meta.env.VITE_API_URL}/auth/check-email`, { identifier: usePhone ? phoneNumber : email })
                .then(res => {
                    if (res.data.exists) {
                        setError(`${usePhone ? 'Phone number' : 'Email'} is already unavailable.`);
                    } else {
                        setStep(2);
                    }
                })
                .catch(() => setStep(2)); // Fallback if check fails
        }
        else if (step === 2) {
            if (!password || password.length < 8) {
                setError('Password must be at least 8 characters.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
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

            // Trigger verification
            if (usePhone) {
                showAlert('Sending verification code to phone...', 'loading');
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        'size': 'invisible',
                        'callback': (response) => {
                            // reCAPTCHA solved
                        }
                    });
                }

                const appVerifier = window.recaptchaVerifier;
                // Ensure phone number has + code if missing? Assuming user enters full number or prefix
                // Just passing as is for now, expecting e.g. +1... or simple number (might fail if no code)
                // Ideally we prepend country code. Lets assume +91 or +1 for test or require user input
                signInWithPhoneNumber(auth, phoneNumber, appVerifier)
                    .then((confirmResult) => {
                        setConfirmationResult(confirmResult);
                        showAlert('OTP sent to your phone!', 'success');
                        setStep(5);
                    }).catch((error) => {
                        console.error(error);
                        showAlert('Failed to send SMS. Try again.', 'error');
                        // Reset widget
                        window.recaptchaVerifier.render().then(widgetId => {
                            grecaptcha.reset(widgetId);
                        });
                    });

            } else {
                // Email Flow
                axios.post(`${import.meta.env.VITE_API_URL}/auth/send-verification`, { email })
                    .then(res => {
                        console.log("OTP sent:", res.data);
                        showAlert('Verification code sent to your email!', 'success');
                        setStep(5);
                    })
                    .catch(err => {
                        showAlert(err.response?.data?.message || 'Failed to send verification code.', 'error');
                    });
            }
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

        try {
            // Verify OTP
            showAlert('Verifying code...', 'loading');
            let firebaseUid = null;

            if (usePhone) {
                if (!confirmationResult) {
                    setError('Session expired. Please try again.');
                    return;
                }
                const result = await confirmationResult.confirm(otp);
                firebaseUid = result.user.uid;
                // Phone verified
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-code`, { email, otp });
            }

            // Combine names for the simple backend 'username' field
            // Append random 4 digits to ensure uniqueness
            const uniqueSuffix = Math.floor(1000 + Math.random() * 9000).toString();
            const fullName = `${firstName} ${lastName}`;
            const generatedUsername = `${firstName}${lastName}${uniqueSuffix}`.replace(/\s+/g, ''); // Remove spaces for username

            const payload = {
                username: generatedUsername,
                password,
            };

            if (usePhone) {
                payload.phoneNumber = phoneNumber;
                payload.firebaseUid = firebaseUid;
            } else {
                payload.email = email;
            }

            await register(payload.username, payload.email, payload.password, payload.phoneNumber, payload.firebaseUid);
            showAlert('Registration successful!', 'success');
            navigate('/dashboard');
        } catch (err) {
            console.error("Registration/Verification Error:", err);
            let errorMessage = 'Verification or registration failed';

            if (err.response) {
                console.log("Error Response Data:", err.response.data);
                if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else {
                    errorMessage = JSON.stringify(err.response.data);
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            showAlert(errorMessage, 'error');
        }
    };

    // Input classes for consistency
    const inputClasses = "w-full h-9 px-3 border border-[#868686] rounded-md hover:border-[#323130] focus:border-[#0067b8] focus:border-2 outline-none text-[15px] placeholder-gray-500 transition-colors";
    const buttonClasses = "w-full bg-[#0067b8] text-white py-2 hover:bg-[#005da6] shadow-sm rounded-md text-[15px] font-semibold transition-colors mt-4";

    // --- Dark Mode / System Theme Logic ---
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handleChange = (e) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const backgroundImage = isDarkMode
        ? (import.meta.env.VITE_BG_IMAGE_DARK_URL || import.meta.env.VITE_BG_IMAGE_URL)
        : import.meta.env.VITE_BG_IMAGE_URL;

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-white md:bg-[#f0f2f5] dark:bg-[#1b1b1b]">
            <CustomAlert
                isOpen={alertConfig.show}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
            />

            {/* Background Image */}
            <div className="absolute inset-0 z-0 hidden md:block transition-all duration-500 ease-in-out"
                style={{
                    backgroundImage: `url('${backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
            </div>

            {/* Card */}
            <div className="z-10 w-full max-w-[440px] bg-white dark:bg-[#2c2c2c] md:shadow-xl p-8 md:p-11 md:rounded-xl transition-all duration-300 dark:text-white">
                <div className="w-full">

                    {/* Header Logo */}
                    <div className="mb-8 flex justify-center">
                        <img src={import.meta.env.VITE_LOGO_URL} alt="Microsoft" className="h-10" />
                    </div>

                    {/* --- STEP 1: EMAIL --- */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">Create account</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-gray-300 text-center">Get started with your free account.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-6">
                                    {usePhone ? (
                                        <MsInput
                                            type="tel"
                                            label="Phone number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            autoFocus
                                        />
                                    ) : (
                                        <MsInput
                                            type="email"
                                            label="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoFocus
                                        />
                                    )}
                                </div>
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={() => { setUsePhone(!usePhone); setError(''); }}
                                        className="text-[#0067b8] text-[13px] hover:underline hover:text-[#005da6]"
                                    >
                                        {usePhone ? "Use your email address" : "Use a phone number instead"}
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <span className="text-[13px] text-[#1b1b1b] dark:text-gray-300">
                                        Already have an account? <Link to="/login" className="text-[#0067b8] dark:text-[#4f93ce] hover:underline">Sign in</Link>
                                    </span>
                                </div>
                                <div className="flex justify-end w-full">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 2: PASSWORD --- */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <div className="flex justify-center mb-6">
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464] dark:text-gray-300" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">Create a password</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-gray-300 text-center">Enter the password you would like to use with your account.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-8 relative">
                                    <MsInput
                                        type={showPassword ? "text" : "password"}
                                        label="Create password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                <div className="mb-8 relative">
                                    <MsInput
                                        type={showConfirmPassword ? "text" : "password"}
                                        label="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <div className="flex justify-end w-full">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 3: NAME --- */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            <div className="flex justify-center mb-6">
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464] dark:text-gray-300" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">What's your name?</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-gray-300 text-center">We need a little more info before we're done.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-6 space-y-4">
                                    <MsInput
                                        type="text"
                                        label="First name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        autoFocus
                                    />
                                    <MsInput
                                        type="text"
                                        label="Last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end mt-8 w-full">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 4: DETAILS (Country/DOB) --- */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            <div className="flex justify-center mb-6">
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464] dark:text-gray-300" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">What's your birthdate?</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-gray-300 text-center">We need this to ensure the account is age-appropriate.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>

                                <div className="mb-6">
                                    <h3 className="block text-xs font-semibold text-[#1b1b1b] dark:text-gray-300 mb-1.5">Country/region</h3>
                                    <div className="relative border border-[#868686] border-b border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-b-2 bg-white dark:bg-[#3b3b3b] dark:border-gray-600 h-[36px] transition-colors rounded-md">
                                        <select
                                            className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] dark:text-white appearance-none"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        >
                                            <option value="India" className="text-black">India</option>
                                            <option value="United States" className="text-black">United States</option>
                                            <option value="United Kingdom" className="text-black">United Kingdom</option>
                                            <option value="Nepal" className="text-black">Nepal</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="block text-xs font-semibold text-[#1b1b1b] dark:text-gray-300 mb-1.5">Birthdate</h3>
                                    <div className="flex gap-2">
                                        {/* Month */}
                                        <div className="relative w-1/2">
                                            <div className="relative border border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-2 bg-white dark:bg-[#3b3b3b] dark:border-gray-600 h-[36px] transition-colors rounded-md">
                                                <select
                                                    className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] dark:text-white appearance-none pt-2"
                                                    value={birthMonth}
                                                    onChange={(e) => setBirthMonth(e.target.value)}
                                                >
                                                    <option value="" disabled></option>
                                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                        <option key={m} value={m} className="text-black">{m}</option>
                                                    ))}
                                                </select>
                                                <label className={`absolute left-2 transition-all duration-200 pointer-events-none text-[#666] dark:text-gray-400 ${birthMonth ? 'top-0 text-xs text-[#0067b8] dark:text-[#4f93ce] -translate-y-1/2 bg-white dark:bg-[#3b3b3b] px-1' : 'top-1.5 text-[15px]'}`}>Month</label>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Day */}
                                        <div className="relative w-1/4">
                                            <div className="relative border border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-2 bg-white dark:bg-[#3b3b3b] dark:border-gray-600 h-[36px] transition-colors rounded-md">
                                                <select
                                                    className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] dark:text-white appearance-none pt-2"
                                                    value={birthDay}
                                                    onChange={(e) => setBirthDay(e.target.value)}
                                                >
                                                    <option value="" disabled></option>
                                                    {[...Array(31)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1} className="text-black">{i + 1}</option>
                                                    ))}
                                                </select>
                                                <label className={`absolute left-2 transition-all duration-200 pointer-events-none text-[#666] dark:text-gray-400 ${birthDay ? 'top-0 text-xs text-[#0067b8] dark:text-[#4f93ce] -translate-y-1/2 bg-white dark:bg-[#3b3b3b] px-1' : 'top-1.5 text-[15px]'}`}>Day</label>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Year */}
                                        <div className="relative w-1/3">
                                            <div className="relative border border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-2 bg-white dark:bg-[#3b3b3b] dark:border-gray-600 h-[36px] transition-colors rounded-md">
                                                <select
                                                    className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] dark:text-white appearance-none pt-2"
                                                    value={birthYear}
                                                    onChange={(e) => setBirthYear(e.target.value)}
                                                >
                                                    <option value="" disabled></option>
                                                    {[...Array(100)].map((_, i) => (
                                                        <option key={i} value={2024 - i} className="text-black">{2024 - i}</option>
                                                    ))}
                                                </select>
                                                <label className={`absolute left-2 transition-all duration-200 pointer-events-none text-[#666] dark:text-gray-400 ${birthYear ? 'top-0 text-xs text-[#0067b8] dark:text-[#4f93ce] -translate-y-1/2 bg-white dark:bg-[#3b3b3b] px-1' : 'top-1.5 text-[15px]'}`}>Year</label>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="flex justify-end mt-8 w-full">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 5: VERIFY (OTP) --- */}
                    {step === 5 && (
                        <div className="animate-fade-in">
                            <div className="flex justify-center mb-6">
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464] dark:text-gray-300" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">Verify {usePhone ? 'phone' : 'email'}</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-gray-300 text-center">
                                Enter the code we sent to <span className="font-semibold">{usePhone ? phoneNumber : email}</span>.
                                <br />If you didn't receive the {usePhone ? 'code' : 'email'}, check your junk folder or <button className="text-[#0067b8] dark:text-[#4f93ce] hover:underline">try again</button>.
                            </p>
                            <div id="recaptcha-container"></div>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6 space-y-4">
                                    <MsInput
                                        type="text"
                                        label="Code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        autoFocus
                                        maxLength={6}
                                        className="text-center tracking-widest"
                                    />
                                </div>
                                <div className="mb-4 flex items-start gap-2">
                                    <input type="checkbox" id="info" defaultChecked className="mt-1 w-4 h-4 border-gray-400 rounded-none" />
                                    <label htmlFor="info" className="text-[13px] text-[#1b1b1b] dark:text-gray-300">I would like information, tips, and offers about Online Saathi products and services.</label>
                                </div>

                                <div className="flex justify-end mt-8 w-full">
                                    <button type="submit" className={buttonClasses}>Next</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div >

            {/* Footer */}
            <div className="absolute bottom-0 w-full z-10 flex flex-col items-center justify-end px-4 py-2 gap-1 mb-4">
                <div className="flex flex-wrap justify-center gap-6 text-xs text-black/60 dark:text-white/80">
                    <span className="hover:underline cursor-pointer">Help and feedback</span>
                    <span className="hover:underline cursor-pointer">Terms of use</span>
                    <span className="hover:underline cursor-pointer">Privacy and cookies</span>
                </div>
                <div className="text-xs text-black/60 dark:text-white/80 text-center mt-1">
                    <span className="hover:underline cursor-pointer">...</span>
                </div>
                <div className="text-xs text-black/60 dark:text-white/80 text-center">
                    Use private browsing if this is not your device. <span className="text-[#0067b8] dark:text-[#4f93ce] hover:underline cursor-pointer">Learn more</span>
                </div>
            </div>
        </div >
    );
};

export default RegisterPage;
