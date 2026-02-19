import React from 'react';

const MsButton = ({ children, onClick, className = '', type = 'button', disabled = false, variant = 'primary' }) => {
    const baseClasses = "px-4 py-2 rounded-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm";

    const variants = {
        primary: "bg-[#0067b8] text-white hover:bg-[#005da6] active:bg-[#005da6]",
        secondary: "bg-white text-[#1b1b1b] border border-[#868686] hover:bg-[#f3f2f1] active:bg-[#edebe9]",
        danger: "bg-[#e81123] text-white hover:bg-[#c50f1f] active:bg-[#a80000]",
        outline: "bg-transparent text-[#0067b8] hover:underline hover:bg-transparent border-none px-0"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    );
};

export default MsButton;
