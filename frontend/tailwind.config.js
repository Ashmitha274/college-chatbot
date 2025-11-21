/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        accent: '#2563EB',
        success: '#22C55E',
        danger: '#EF4444'
      }
    }
  },
  plugins: []
};


