/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'terminal-green': '#00ff00',
                'terminal-amber': '#ffaa00',
                'dark-bg': '#0a0a0a',
                'panel-bg': '#1a1a1a',
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}
