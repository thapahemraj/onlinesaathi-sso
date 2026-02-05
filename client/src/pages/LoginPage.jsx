import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Add missing state for Forgot Password flow
    const [otpInput, setOtpInput] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Re-using the same styling classes as RegisterPage for consistency
    const inputClasses = "w-full h-10 px-3 border-b border-[#868686] hover:border-[#323130] focus:border-[#0067b8] focus:border-b-2 outline-none text-[15px] placeholder-gray-500 transition-colors bg-transparent pt-3 pb-1";
    // NOTE: Microsoft inputs usually are border-top/left/right transparent and border-bottom visible, OR full border. 
    // The screenshot shows a full border input for "Enter code" but possibly "Floating Label" style. 
    // Sticking to the previous full border rounded-md but adding the icon container.
    const inputClassesRounded = "w-full h-9 px-3 border border-[#868686] rounded-md hover:border-[#323130] focus:border-[#0067b8] focus:border-2 outline-none text-[15px] placeholder-gray-500 transition-colors";

    const buttonClasses = "bg-[#0067b8] text-white px-9 py-1.5 min-w-[108px] hover:bg-[#005da6] shadow-sm rounded-md text-[15px] font-semibold transition-colors";

    const handleNext = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (step === 1) {
            if (!email) {
                setError('Please enter your email, phone, or Skype.');
                setIsLoading(false);
                return;
            }

            try {
                // Check if user exists
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/check-email`, { email });

                if (res.data.exists) {
                    // User exists -> Show password screen
                    setStep(2);
                } else {
                    // User does NOT exist -> Redirect to Register flow with email
                    navigate('/register', { state: { email } });
                }
            } catch (err) {
                console.error(err);
                // Fallback: If backend error (or 404), maybe just assume login? 
                // But for "Unified Flow", we specifically want to handle "not found".
                // If API fails, let's show generic error or network error.
                setError('Something went wrong. Please try again.');
            }
        }
        else if (step === 2) {
            // Attempt Login
            try {
                await login(email, password);
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message || 'Login failed');
            }
        }
        else if (step === 3) {
            // Initiate Forgot Password (send mock email)
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
                console.log("Mock OTP:", res.data.mockOtp);
                alert(`OTP sent successfully to ${email}`);
                setStep(4);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to send code. Check server logs.');
            }
        }
        else if (step === 4) {
            // Verify OTP - we'll just move to next step, actual verify happens at final reset or separate endpoint.
            // But here we'll assume we pass OTP to the reset endpoint.
            if (!otpInput) {
                setError('Please enter the code.');
                setIsLoading(false);
                return;
            }
            // Optional: verify OTP here via API if wanted, but doing it in final step is easier for now.
            setStep(5);
        }
        else if (step === 5) {
            // Reset Password
            if (newPassword.length < 8) {
                setError('Password must be at least 8 characters.');
                setIsLoading(false);
                return;
            }
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                    email,
                    otp: otpInput,
                    newPassword
                });
                // Success - Go back to login (Step 2) with password cleared
                setStep(2);
                setPassword('');
                setError('Password changed! Please sign in.');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to reset password');
            }
        }

        setIsLoading(false);
    };

    const handleResend = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
            console.log("Resent OTP:", res.data.mockOtp);
            // Optional: Show a temporary success message instead of just clearing error
            alert(`Code sent to ${email}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 4) setStep(3);
        else if (step === 5) setStep(4);
        else setStep(step - 1);
        setError('');
        setPassword('');
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-[#f0f2f5]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 hidden md:block"
                style={{
                    backgroundImage: `url('${import.meta.env.VITE_BG_IMAGE_URL}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
            </div>

            {/* Login Card */}
            <div className="z-10 w-full max-w-[440px] bg-white shadow-xl p-11 rounded-xl transition-all duration-300 relative">

                {/* Back Button (Absolute Top Left) */}
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="absolute left-6 top-6 text-[#1b1b1b] hover:bg-gray-100 p-2 rounded-full transition-colors"
                        title="Back"
                    >
                        <ArrowLeft size={20} className="text-[#646464]" />
                    </button>
                )}

                <div className="w-full">

                    {/* Header Logo */}
                    <div className="mb-4 flex justify-center">
                        <img src={import.meta.env.VITE_LOGO_URL} alt="Online Saathi" className="h-6" />
                    </div>

                    {/* --- STEP 1: EMAIL ENTRY --- */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-6 leading-tight">Sign in</h2>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        className={inputClassesRounded}
                                        placeholder="Email, phone, or Skype"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <span className="text-[13px] text-[#1b1b1b]">
                                        No account? <Link to="/register" className="text-[#0067b8] hover:underline">Create one!</Link>
                                    </span>
                                </div>
                                <div className="mb-6">
                                    <span className="text-[#0067b8] text-[13px] hover:underline cursor-pointer">Sign in with a security key</span>
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" className={buttonClasses} disabled={isLoading}>
                                        {isLoading ? 'Checking...' : 'Next'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 2: PASSWORD ENTRY --- */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            {/* Email Pill Badge */}
                            <div className="flex justify-center mb-4">
                                <div className="bg-white border hover:bg-gray-50 cursor-pointer border-gray-200 rounded-full px-3 py-1 flex items-center gap-2 shadow-sm transition-colors text-sm text-[#1b1b1b]">
                                    {email}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-4 leading-tight">Enter password</h2>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-4 relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`${inputClassesRounded} pr-10`}
                                        placeholder="Password"
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
                                <div className="mb-6">
                                    <button type="button" onClick={() => setStep(3)} className="text-[#0067b8] text-[13px] hover:underline">Forgot password?</button>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className={buttonClasses} disabled={isLoading}>
                                        {isLoading ? 'Signing in...' : 'Sign in'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 3: FORGOT PASSWORD - CONFIRM --- */}
                    {step === 3 && (
                        <div className="animate-fade-in">
                            {/* Email Pill Badge */}
                            <div className="flex justify-center mb-4">
                                <span className="text-[#1b1b1b] font-semibold">{email}</span>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight">Verify your identity</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b]">We will send a verification code to your email.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="flex justify-end mt-8">
                                    <button type="submit" className={buttonClasses} disabled={isLoading}>
                                        {isLoading ? 'Sending...' : 'Get code'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 4: ENTER OTP --- */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            {/* Email Pill Badge */}
                            <div className="flex justify-center mb-6">
                                <span className="text-[#1b1b1b] font-semibold">{email}</span>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-4 leading-tight">Enter code</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b]">We sent a code to <span className="font-semibold">{email}</span>. Please enter it below.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-6">
                                    <input
                                        type="text"
                                        className={inputClassesRounded}
                                        placeholder="Code"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-8">
                                    <button type="button" onClick={handleResend} disabled={isLoading} className="text-[#0067b8] text-[13px] hover:underline disabled:opacity-50">
                                        {isLoading ? 'Sending...' : 'Didn\'t receive the code? Resend it'}
                                    </button>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className={buttonClasses} disabled={isLoading}>
                                        Next
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* --- STEP 5: RESET PASSWORD --- */}
                    {step === 5 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-[#1b1b1b] mb-2 leading-tight">Reset password</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b]">Create a new password for your account.</p>

                            {error && <div className="text-[#e81123] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-4">
                                    <input
                                        type="password"
                                        className={inputClasses}
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button type="submit" className={buttonClasses} disabled={isLoading}>Sign in</button>
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

export default LoginPage;
