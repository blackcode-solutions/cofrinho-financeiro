/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
        },
        background: '#F8FAFC',
        card: '#FFFFFF',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#16A34A',
        ink: '#111827',
        muted: '#6B7280',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        card: '20px',
        button: '16px',
      },
    },
  },
  plugins: [],
};
