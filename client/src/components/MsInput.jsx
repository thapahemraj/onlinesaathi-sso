import { useState } from 'react';

const MsInput = ({ type = "text", label, value, onChange, error, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    // Microsoft style:
    // - Gray border usually
    // - Blue border on focus
    // - Label floats up
    // - Error state: Red border, red subtext (handled by parent usually, but we can style border)

    return (
        <div className="relative w-full mb-2">
            <div
                className={`
                    relative border rounded-none
                    ${error ? 'border-[#e81123]' : isFocused ? 'border-[#0067b8] border-b-2' : 'border-[#868686] border-b'}
                    bg-white h-[36px] transition-colors
                `}
            >
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="
                        peer block w-full h-full px-3 py-1 bg-transparent
                        text-[15px] text-[#1b1b1b] outline-none
                        placeholder-transparent
                    "
                    placeholder={label} // Needed for :not(:placeholder-shown) logic if using CSS only, but we allow mixed
                    {...props}
                />
                <label
                    className={`
                        absolute left-3 transition-all duration-200 pointer-events-none px-1
                        ${(isFocused || value)
                            ? 'top-0 text-xs text-[#0067b8] transform -translate-y-[55%] bg-white' // Floating position with bg
                            : 'top-1.5 text-[15px] text-[#666]' // Default position
                        }
                        ${error ? 'text-[#e81123]' : ''}
                    `}
                >
                    {label}
                </label>
            </div>
            {error && <span className="text-[#e81123] text-xs mt-0.5 block">{error}</span>}
        </div>
    );
};

export default MsInput;
