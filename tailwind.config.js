/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Archivo', 'system-ui', '-apple-system', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
            },
            colors: {
                background: '#F8F0E5', // Cream
                foreground: '#082052', // Dark Blue (same as primary)
                primary: '#082052',    // Dark Blue
                accents: '#082052',    // Dark Blue Accent
                pharma: '#34D399',     // Pharma Green (Emerald-400)
                'text-main': '#082052', // Replaced 'text' to avoid conflict
                'text-light': '#4B5563', // Gray-600

                // Shadcn tokens
                border: '#E5E7EB',       // Gray-200
                'muted-foreground': '#6B7280', // Gray-500
                accent: '#F3F4F6',       // Gray-100 (for hover states)
                'accent-foreground': '#082052',
            },
        },
    },
    plugins: [],
}
