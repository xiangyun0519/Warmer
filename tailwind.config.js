/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#58A6FF',
        secondary: '#79B8FF',
        bgPrimary: '#0D1117',
        bgSecondary: '#161B26',
        textPrimary: '#E6EDF3',
        textSecondary: '#8B949E',
        textTertiary: '#6B7280',
        statusRed: '#F85149',
        statusYellow: '#D29922',
        statusGreen: '#3FB950',
        glassBg: 'rgba(22, 27, 38, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.06)',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(88, 166, 255, 0.3)',
      },
      borderRadius: {
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
    },
  },
  plugins: [],
}