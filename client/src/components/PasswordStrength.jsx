import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrength = ({ password }) => {
    const [strength, setStrength] = useState(0);
    const [checks, setChecks] = useState({
        length: false,
        number: false,
        upper: false,
        special: false
    });

    useEffect(() => {
        const newChecks = {
            length: password.length >= 8,
            number: /\d/.test(password),
            upper: /[A-Z]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        setChecks(newChecks);

        let score = 0;
        if (newChecks.length) score += 1;
        if (newChecks.number) score += 1;
        if (newChecks.upper) score += 1;
        if (newChecks.special) score += 1;
        setStrength(score);
    }, [password]);

    const getColor = () => {
        if (strength <= 1) return 'bg-red-500';
        if (strength === 2) return 'bg-orange-500';
        if (strength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getLabel = () => {
        if (strength <= 1) return 'Weak';
        if (strength === 2) return 'Fair';
        if (strength === 3) return 'Good';
        return 'Strong';
    };

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Password strength</span>
                <span className={`text-xs font-semibold ${strength <= 1 ? 'text-red-500' :
                        strength === 2 ? 'text-orange-500' :
                            strength === 3 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                    {password ? getLabel() : ''}
                </span>
            </div>

            <div className="flex gap-1 h-1 mb-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-300 ${i <= strength ? getColor() : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    ></div>
                ))}
            </div>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <li className={`flex items-center gap-1.5 ${checks.length ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {checks.length ? <Check size={12} /> : <div className="w-3" />}
                    At least 8 characters
                </li>
                <li className={`flex items-center gap-1.5 ${checks.upper ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {checks.upper ? <Check size={12} /> : <div className="w-3" />}
                    Uppercase letter
                </li>
                <li className={`flex items-center gap-1.5 ${checks.number ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {checks.number ? <Check size={12} /> : <div className="w-3" />}
                    Number
                </li>
                <li className={`flex items-center gap-1.5 ${checks.special ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {checks.special ? <Check size={12} /> : <div className="w-3" />}
                    Special character
                </li>
            </ul>
        </div>
    );
};

export default PasswordStrength;
