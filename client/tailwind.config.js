/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                'xs': '375px',
                // Keep standard sm (640), md (768), lg (1024)
            },

            colors: {
                ms: {
                    blue: '#0078D4',
                    darkBlue: '#005A9E',
                    gray: '#f3f2f1',
                    text: '#323130',
                    border: '#8a8886',
                }
            },
            fontFamily: {
                segoe: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
            },
            keyframes: {
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            },
            animation: {
                'slide-down': 'slideDown 0.3s ease-out forwards',
            }
        },
    },
    plugins: [],
}
