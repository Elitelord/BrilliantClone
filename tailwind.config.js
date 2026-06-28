/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxHeight: {
        // Height-driven so charts fit between the prompt and the pinned footer
        // without forcing scroll. SVGs keep aspect ratio (letterboxing with side
        // space when capped), so this never clips — it scales the chart down to
        // fit the available viewport height. Floor keeps it usable on short
        // landscape phones; ceiling avoids huge charts on tall desktops.
        chart: 'clamp(190px, 46vh, 430px)',
      },
    },
  },
  plugins: [],
};
