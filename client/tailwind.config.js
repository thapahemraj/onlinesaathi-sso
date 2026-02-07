/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            screens: {
                'sm': '350px',
                'md': '450px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
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
