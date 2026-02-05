import React from 'react';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

const CustomAlert = ({ isOpen, message, type = 'success', onClose }) => {
    if (!isOpen) return null;

    let Icon = CheckCircle;
    let iconColor = 'text-green-500';
    let borderColor = 'border-green-500';

    if (type === 'error') {
        Icon = AlertCircle;
        iconColor = 'text-red-500';
        borderColor = 'border-red-500';
    } else if (type === 'loading') {
        Icon = Loader2;
        iconColor = 'text-[#0067b8]';
        borderColor = 'border-[#0067b8]';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 bg-black/20 backdrop-blur-[1px] transition-opacity">
            <div className={`bg-white rounded-lg shadow-xl p-5 w-full max-w-sm flex items-start gap-4 border-l-4 ${borderColor} animate-slide-down`}>
                <div className={`${iconColor} mt-0.5`}>
                    <Icon size={24} className={type === 'loading' ? 'animate-spin' : ''} />
                </div>
                <div className="flex-1">
                    <h3 className="text-[#1b1b1b] font-semibold text-[15px] mb-1">
                        {type === 'loading' ? 'Please wait' : type === 'error' ? 'Attention' : 'Success'}
                    </h3>
                    <p className="text-[#666] text-sm leading-relaxed">
                        {message}
                    </p>
                </div>
                {type !== 'loading' && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-[#1b1b1b] transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CustomAlert;
