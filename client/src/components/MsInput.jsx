import { useState, useRef, useEffect } from 'react';

const MsInput = ({ type = "text", label, value, onChange, error, autoFocus, className = "", ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    // Handle autoFocus correctly to ensure label floats
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
            setIsFocused(true);
        }
    }, [autoFocus]);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
        <div className="relative w-full mb-2">
            <div
                className={`
                    relative border rounded-md
                    ${error ? 'border-[#e81123]' : isFocused ? 'border-[#0067b8] border-2' : 'border-[#868686] dark:border-gray-600 border'}
                    bg-white dark:bg-[#3b3b3b] h-[40px] transition-colors flex items-center
                `}
            >
                <input
                    ref={inputRef}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`
                        peer block w-full h-full px-3 pt-2 pb-0 bg-transparent
                        text-[15px] text-[#1b1b1b] dark:text-white outline-none
                        placeholder-transparent
                        ${className}
                    `}
                    placeholder={label}
                    {...props}
                />
                <label
                    className={`
                        absolute left-3 transition-all duration-200 pointer-events-none px-1 bg-white dark:bg-[#3b3b3b]
                        ${(isFocused || value)
                            ? 'top-0 text-xs text-[#0067b8] dark:text-[#4f93ce] transform -translate-y-[55%]'
                            : 'top-1/2 text-[15px] text-[#666] dark:text-gray-400 transform -translate-y-1/2'
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
