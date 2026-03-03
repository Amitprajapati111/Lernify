/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                },
                secondary: '#4f46e5',
                dark: '#0f172a'
            },
            keyframes: {
                'float-up': {
                    '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
                    '10%': { opacity: '1', transform: 'translateY(-20px) scale(1.2)' },
                    '50%': { transform: 'translateY(-100px) scale(1)' },
                    '100%': { transform: 'translateY(-200px) scale(0.8)', opacity: '0' },
                }
            },
            animation: {
                'float-up': 'float-up 3s ease-out forwards',
            }
        },
    },
    plugins: [],
}
