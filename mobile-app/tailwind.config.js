/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#0d3331',
        },
        medical: {
          teal: '#0D9488',
          'teal-dark': '#0f766e',
          'teal-light': '#5eead4',
          green: '#10b981',
          orange: '#f97316',
          neutral: '#f3f4f6',
        },
        primary: {
          DEFAULT: '#0d9488',
          dark: '#00e5ff',
        },
        secondary: {
          DEFAULT: '#10b981',
          dark: '#4ade80',
        },
        accent: {
          DEFAULT: '#f97316',
          dark: '#fde047',
        },
      },
    },
  },
  plugins: [],
};
