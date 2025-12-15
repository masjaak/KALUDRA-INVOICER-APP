/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Sets Poppins as the default font for the app
        sans: ['Poppins', 'sans-serif'],
        // Ensures 'font-poppins' class used in App.tsx works explicitly
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        black: '#000000',
        white: '#ffffff',
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '2px',
        md: '4px',
        lg: '8px',
      }
    },
  },
  plugins: [],
}