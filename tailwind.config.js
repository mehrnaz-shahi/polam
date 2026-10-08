/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eefcf6', 100:'#d8f7e9', 500:'#16a56b', 600:'#0e8f5a', 700:'#087447' },
        ink: '#17211b',
        muted: '#718078',
        surface: '#f7faf8'
      },
      fontFamily: { vazir: ['Vazirmatn'] }
    }
  },
  plugins: []
};
