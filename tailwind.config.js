/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        eastside: { navy: '#0B1F3A', blue: '#2563EB', sky: '#EAF3FF' }
      },
      boxShadow: { soft: '0 18px 50px rgba(15, 23, 42, 0.08)' }
    }
  },
  plugins: []
};
