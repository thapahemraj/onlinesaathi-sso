import { Link } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

const ProfileCompletion = ({ user }) => {
    if (!user) return null;

    const steps = [
        { id: 'name', label: 'Add your name', completed: !!(user.firstName && user.lastName), link: '/dashboard/info' },
        { id: 'photo', label: 'Add profile photo', completed: !!user.profilePicture, link: '/dashboard/info' },
        { id: 'phone', label: 'Add phone number', completed: !!user.phoneNumber, link: '/dashboard/info' },
        { id: 'recovery', label: 'Add recovery email', completed: !!user.recoveryEmail, link: '/dashboard/security' },
        { id: '2fa', label: 'Turn on 2FA', completed: !!user.twoFactorEnabled, link: '/dashboard/security' },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = Math.round((completedCount / steps.length) * 100);

    if (progress === 100) return null; // Hide if complete

    const nextStep = steps.find(s => !s.completed);

    return (
        <div className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Complete your profile</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get the most out of your account.</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-[#0067b8] dark:text-[#4f93ce]">{progress}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                <div
                    className="bg-[#0067b8] dark:bg-[#4f93ce] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Next Step Suggestion */}
            {nextStep && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Circle size={20} className="text-[#0067b8] dark:text-[#4f93ce]" />
                        <span className="font-medium text-gray-900 dark:text-white">{nextStep.label}</span>
                    </div>
                    <Link
                        to={nextStep.link}
                        className="text-sm font-semibold text-[#0067b8] dark:text-[#4f93ce] hover:underline flex items-center gap-1"
                    >
                        Do it now <ArrowRight size={16} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ProfileCompletion;
