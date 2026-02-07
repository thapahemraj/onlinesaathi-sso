import { useTheme } from '../context/ThemeContext';

import { startAuthentication } from '@simplewebauthn/browser';
import axios from 'axios';

const LoginPage = () => {
    // ... (existing state)
    const { theme } = useTheme();

    // Passkey Login Handler
    const handlePasskeyLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            // 1. Get options from server
            const resp = await axios.get(`${import.meta.env.VITE_API_URL}/auth/webauthn/login/options`);

            // 2. Pass options to browser authenticator
            let asseResp;
            try {
                asseResp = await startAuthentication(resp.data);
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    throw new Error('User cancelled the request.');
                }
                throw error;
            }

            // 3. Send response to server
            const verificationResp = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/webauthn/login/verify`,
                asseResp,
                { withCredentials: true }
            );

            if (verificationResp.data.verified) {
                const { token, user } = verificationResp.data;
                login(user, token);
                navigate('/dashboard');
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Failed to sign in with passkey.');
        } finally {
            setIsLoading(false);
        }
    };

    const bgImage = theme === 'dark'
        ? 'https://logincdn.msauth.net/shared/5/images/fluent_web_dark_2_bf5f23287bc9f60c9be2.svg'
        : import.meta.env.VITE_BG_IMAGE_URL;

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-white dark:bg-[#1b1b1b] md:bg-[#f0f2f5] dark:md:bg-[#000000]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 hidden md:block"
                style={{
                    backgroundImage: `url('${bgImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
            </div>

            {/* Login Card */}
            <div className="z-10 w-full max-w-[440px] bg-white dark:bg-[#1b1b1b] md:shadow-xl p-8 md:p-11 md:rounded-xl transition-all duration-300 relative border-transparent dark:border dark:border-[#323130]">

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
                        <img src={import.meta.env.VITE_LOGO_URL} alt="Online Saathi" className="h-10" />
                    </div>

                    {/* --- STEP 1: EMAIL ENTRY or REMEMBERED ACCOUNT --- */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            {rememberedUser ? (
                                <>
                                    <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4 leading-tight text-center">Pick an account</h2>
                                    <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-white text-center">Select an account to sign in.</p>

                                    {/* Remembered User Card */}
                                    <div
                                        onClick={handleAccountClick}
                                        className="flex items-center gap-4 p-4 hover:bg-[#f2f2f2] dark:hover:bg-[#2b2b2b] cursor-pointer rounded-none border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors mb-2 -mx-4 sm:mx-0"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#0078D4] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                            {rememberedUser?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[#1b1b1b] dark:text-white font-semibold truncate">{rememberedUser.username}</div>
                                            <div className="text-[#1b1b1b] dark:text-gray-300 text-sm truncate">{rememberedUser.email}</div>
                                            <div className="text-[#666] dark:text-gray-400 text-xs mt-0.5">Signed in</div>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                            >
                                                <MoreHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
                                            </button>

                                            {showMenu && (
                                                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#2b2b2b] rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
                                                    <button
                                                        onClick={handleForgetAccount}
                                                        className="w-full text-left px-4 py-2 text-sm text-[#1b1b1b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    >
                                                        Forget
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Use Another Account */}
                                    <div
                                        onClick={handleUseAnotherAccount}
                                        className="flex items-center gap-4 p-4 hover:bg-[#f2f2f2] dark:hover:bg-[#2b2b2b] cursor-pointer transition-colors mb-6 -mx-4 sm:mx-0"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                            <div className="w-8 h-8 rounded-full border-2 border-[#1b1b1b] dark:border-white flex items-center justify-center">
                                                <span className="text-xl font-light pb-0.5 text-[#1b1b1b] dark:text-white">+</span>
                                            </div>
                                        </div>
                                        <div className="text-[#1b1b1b] dark:text-white font-semibold text-[15px]">Use another account</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">Sign in</h2>
                                    <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-white text-center">to continue to Online Saathi</p>
                                    {error && <div className="text-[#e81123] dark:text-[#f3525a] text-sm mb-4">{error}</div>}
                                    <form onSubmit={handleNext}>
                                        <div className="mb-4">
                                            <MsInput
                                                type="email"
                                                label="Enter email or phone"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <span className="text-[13px] text-[#1b1b1b] dark:text-white">
                                                No account? <Link to="/register" className="text-[#0067b8] dark:text-[#4f9cdd] hover:underline">Create one!</Link>
                                            </span>
                                        </div>
                                        <div className="mb-6">
                                            <span
                                                onClick={handlePasskeyLogin}
                                                className="text-[#0067b8] dark:text-[#4f9cdd] text-[13px] hover:underline cursor-pointer"
                                            >
                                                Sign in with a security key
                                            </span>
                                        </div>
                                        <div className="flex justify-end w-full">
                                            <button type="submit" className={buttonClasses} disabled={isLoading}>
                                                {isLoading ? 'Checking...' : 'Next'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* --- STEP 2: PASSWORD ENTRY --- */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            {/* Email Pill Badge */}
                            {!rememberedUser && (
                                <div className="flex justify-center mb-4">
                                    <div className="bg-white dark:bg-[#1b1b1b] border hover:bg-gray-50 dark:hover:bg-[#2b2b2b] cursor-pointer border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 flex items-center gap-2 shadow-sm transition-colors text-sm text-[#1b1b1b] dark:text-white">
                                        {email}
                                    </div>
                                </div>
                            )}

                            {/* If remembered user, show simpler header */}
                            {rememberedUser && (
                                <div className="mb-6 flex justify-center" onClick={() => setStep(1)} role="button">
                                    <div className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#2b2b2b] p-2 px-3 rounded transition-colors cursor-pointer w-fit">
                                        <ArrowLeft size={16} className="text-[#1b1b1b] dark:text-white" />
                                        <div className="text-[#1b1b1b] dark:text-white text-sm">{email}</div>
                                    </div>
                                </div>
                            )}

                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">Enter password</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-white text-center">Please enter your password.</p>

                            {error && <div className="text-[#e81123] dark:text-[#f3525a] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-4 relative">
                                    <MsInput
                                        type={showPassword ? "text" : "password"}
                                        label="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <div className="mb-6">
                                    <button type="button" onClick={() => setStep(3)} className="text-[#0067b8] dark:text-[#4f9cdd] text-[13px] hover:underline">Forgot password?</button>
                                </div>
                                <div className="flex justify-end w-full">
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
                                <span className="text-[#1b1b1b] dark:text-white font-semibold">{email}</span>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">Verify your identity</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-white text-center">We will send a verification code to your email.</p>

                            {error && <div className="text-[#e81123] dark:text-[#f3525a] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="flex justify-end mt-8 w-full">
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
                                <span className="text-[#1b1b1b] dark:text-white font-semibold">{email}</span>
                            </div>

                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-4 leading-tight text-center">Enter code</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-white text-center">We sent a code to <span className="font-semibold">{email}</span>. Please enter it below.</p>

                            {error && <div className="text-[#e81123] dark:text-[#f3525a] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-6">
                                    <MsInput
                                        type="text"
                                        label="Code"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-8">
                                    <button type="button" onClick={handleResend} disabled={isLoading} className="text-[#0067b8] dark:text-[#4f9cdd] text-[13px] hover:underline disabled:opacity-50">
                                        {isLoading ? 'Sending...' : 'Didn\'t receive the code? Resend it'}
                                    </button>
                                </div>
                                <div className="flex justify-end w-full">
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
                            <h2 className="text-2xl font-bold text-[#1b1b1b] dark:text-white mb-2 leading-tight text-center">Reset password</h2>
                            <p className="text-[15px] mb-4 text-[#1b1b1b] dark:text-white text-center">Create a new password for your account.</p>

                            {error && <div className="text-[#e81123] dark:text-[#f3525a] text-sm mb-4">{error}</div>}

                            <form onSubmit={handleNext}>
                                <div className="mb-4">
                                    <MsInput
                                        type="password"
                                        label="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <MsInput
                                        type="password"
                                        label="Confirm new password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end mt-8 w-full">
                                    <button type="submit" className={buttonClasses} disabled={isLoading}>Sign in</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer */}
            {/* Footer */}
            <div className="absolute bottom-0 w-full z-10 flex flex-col items-center justify-end px-4 py-2 gap-1 mb-4">
                <div className="flex flex-wrap justify-center gap-6 text-xs text-black/60">
                    <span className="hover:underline cursor-pointer">Help and feedback</span>
                    <span className="hover:underline cursor-pointer">Terms of use</span>
                    <span className="hover:underline cursor-pointer">Privacy and cookies</span>
                </div>
                {/* Privacy Text */}
                <div className="text-xs text-black/60 text-center mt-1">
                    <span className="hover:underline cursor-pointer">...</span>
                </div>
                <div className="text-xs text-black/60 text-center">
                    Use private browsing if this is not your device. <span className="text-[#0067b8] hover:underline cursor-pointer">Learn more</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
