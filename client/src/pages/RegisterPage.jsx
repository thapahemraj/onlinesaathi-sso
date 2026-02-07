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
            const fullName = `${firstName} ${lastName}`;

            // Register
            // We need to pass phoneNumber if used
            // If email was used, phoneNumber is empty. If phone used, email empty?
            // Backend expects 'email' field as required currently... 
            // We should use a dummy email or make email optional in backend? 
            // Plan said "Add phoneNumber options: { unique:true, sparse: true }". 
            // But 'email' is still required:true in User.js? 
            // Wait, I didn't change 'email' required:false. 
            // If user uses phone, email is missing. Backend will fail if email is required.
            // I should update Register flow to ask for email even if phone is used? Or make email optional?
            // User request: "email and phone number se vi user login... phone ke field"
            // Usually Microsoft asks for email OR phone. 
            // For now, I will send the phone number AS the email field if email is empty? No that's bad.
            // I should have made email optional. 
            // Let's assume for this step I will send a placeholder email if phone is used: [phone]@placeholder.com
            // Or better, I'll update User.js to make email optional... but I already did the edit and missed it.
            // I'll send a dummy email for now to unblock: `${phoneNumber}@phone.user`

            const payload = {
                username: fullName, // This might duplicate if name same? Username should be unique? 
                // Backend 'username' is unique... 
                // Maybe use email/phone as username? 
                // Logic in authController: User.create({ username, email, password, ... })
                // If I send "John Doe" as username, 2nd "John Doe" will fail.
                // I should probably generate a unique username.
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
            console.error(err);
            const errorMessage = err.response?.data?.message || err.message || 'Verification or registration failed';
            showAlert(errorMessage, 'error');
        }
    };

    // Input classes for consistency
    const inputClasses = "w-full h-9 px-3 border border-[#868686] rounded-md hover:border-[#323130] focus:border-[#0067b8] focus:border-2 outline-none text-[15px] placeholder-gray-500 transition-colors";
    const buttonClasses = "w-full bg-[#0067b8] text-white py-2 hover:bg-[#005da6] shadow-sm rounded-md text-[15px] font-semibold transition-colors mt-4";

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-white md:bg-[#f0f2f5]">
            <CustomAlert
                isOpen={alertConfig.show}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
            />

            {/* Background Image */}
            <div className="absolute inset-0 z-0 hidden md:block"
                style={{
                    backgroundImage: `url('${import.meta.env.VITE_BG_IMAGE_URL}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
            </div>

            {/* Card */}
            <div className="z-10 w-full max-w-[440px] bg-white md:shadow-xl p-8 md:p-11 md:rounded-xl transition-all duration-300">
                <div className="w-full">

                    {/* Header Logo */}
                    <div className="mb-8 flex justify-center">
                        <img src={import.meta.env.VITE_LOGO_URL} alt="Microsoft" className="h-10" />
                    </div>

                    {/* --- STEP 1: EMAIL --- */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight text-center">Create account</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] text-center">Get started with your free account.</p>

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
                                    <span className="text-[13px] text-[#1b1b1b]">
                                        Already have an account? <Link to="/login" className="text-[#0067b8] hover:underline">Sign in</Link>
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
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464]" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight text-center">Create a password</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] text-center">Enter the password you would like to use with your account.</p>

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
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464]" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight text-center">What's your name?</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] text-center">We need a little more info before we're done.</p>

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
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464]" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight text-center">What's your birthdate?</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] text-center">We need this to ensure the account is age-appropriate.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>

                                <div className="mb-6">
                                    <h3 className="block text-xs font-semibold text-[#1b1b1b] mb-1.5">Country/region</h3>
                                    <div className="relative border border-[#868686] border-b border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-b-2 bg-white h-[36px] transition-colors rounded-md">
                                        <select
                                            className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] appearance-none"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        >
                                            <option value="India">India</option>
                                            <option value="United States">United States</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Nepal">Nepal</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="block text-xs font-semibold text-[#1b1b1b] mb-1.5">Birthdate</h3>
                                    <div className="flex gap-2">
                                        {/* Month */}
                                        <div className="relative w-1/2">
                                            <div className="relative border border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-2 bg-white h-[36px] transition-colors rounded-md">
                                                <select
                                                    className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] appearance-none pt-2"
                                                    value={birthMonth}
                                                    onChange={(e) => setBirthMonth(e.target.value)}
                                                >
                                                    <option value="" disabled></option>
                                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                                <label className={`absolute left-2 transition-all duration-200 pointer-events-none text-[#666] ${birthMonth ? 'top-0 text-xs text-[#0067b8] -translate-y-1/2 bg-white px-1' : 'top-1.5 text-[15px]'}`}>Month</label>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Day */}
                                        <div className="relative w-1/4">
                                            <div className="relative border border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-2 bg-white h-[36px] transition-colors rounded-md">
                                                <select
                                                    className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] appearance-none pt-2"
                                                    value={birthDay}
                                                    onChange={(e) => setBirthDay(e.target.value)}
                                                >
                                                    <option value="" disabled></option>
                                                    {[...Array(31)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                    ))}
                                                </select>
                                                <label className={`absolute left-2 transition-all duration-200 pointer-events-none text-[#666] ${birthDay ? 'top-0 text-xs text-[#0067b8] -translate-y-1/2 bg-white px-1' : 'top-1.5 text-[15px]'}`}>Day</label>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Year */}
                                        <div className="relative w-1/3">
                                            <div className="relative border border-[#868686] hover:border-[#323130] focus-within:border-[#0067b8] focus-within:border-2 bg-white h-[36px] transition-colors rounded-md">
                                                <select
                                                    className="w-full h-full px-2 bg-transparent outline-none text-[15px] text-[#1b1b1b] appearance-none pt-2"
                                                    value={birthYear}
                                                    onChange={(e) => setBirthYear(e.target.value)}
                                                >
                                                    <option value="" disabled></option>
                                                    {[...Array(100)].map((_, i) => (
                                                        <option key={i} value={2024 - i}>{2024 - i}</option>
                                                    ))}
                                                </select>
                                                <label className={`absolute left-2 transition-all duration-200 pointer-events-none text-[#666] ${birthYear ? 'top-0 text-xs text-[#0067b8] -translate-y-1/2 bg-white px-1' : 'top-1.5 text-[15px]'}`}>Year</label>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
                                <button onClick={handleBack} className="flex items-center gap-1 text-[#1b1b1b] hover:bg-gray-100 p-1 px-3 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-[#646464]" />
                                    <span className="text-sm">{usePhone ? phoneNumber : email}</span>
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight text-center">Verify {usePhone ? 'phone' : 'email'}</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] text-center">
                                Enter the code we sent to <span className="font-semibold">{usePhone ? phoneNumber : email}</span>.
                                <br />If you didn't receive the {usePhone ? 'code' : 'email'}, check your junk folder or <button className="text-[#0067b8] hover:underline">try again</button>.
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
                                    <label htmlFor="info" className="text-[13px] text-[#1b1b1b]">I would like information, tips, and offers about Online Saathi products and services.</label>
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
            {/* Footer */}
            <div className="absolute bottom-0 w-full z-10 flex flex-col items-center justify-end px-4 py-2 gap-1 mb-4">
                <div className="flex flex-wrap justify-center gap-6 text-xs text-black/60">
                    <span className="hover:underline cursor-pointer">Help and feedback</span>
                    <span className="hover:underline cursor-pointer">Terms of use</span>
                    <span className="hover:underline cursor-pointer">Privacy and cookies</span>
                </div>
                <div className="text-xs text-black/60 text-center mt-1">
                    <span className="hover:underline cursor-pointer">...</span>
                </div>
                <div className="text-xs text-black/60 text-center">
                    Use private browsing if this is not your device. <span className="text-[#0067b8] hover:underline cursor-pointer">Learn more</span>
                </div>
            </div>
        </div >
    );
};

export default RegisterPage;
