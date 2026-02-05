/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
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
        },
    },
    plugins: [],
}
