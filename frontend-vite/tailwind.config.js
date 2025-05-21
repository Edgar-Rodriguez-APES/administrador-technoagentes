/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4285F4',
          dark: '#3367D6',
          light: '#8ab4f8',
        },
        secondary: {
          DEFAULT: '#d58bf1',
          dark: '#c77ee0',
          light: '#e879f9',
        },
        success: {
          DEFAULT: '#34A853',
          dark: '#2E8B46',
        },
        warning: {
          DEFAULT: '#FFA726',
          dark: '#F57C00',
        },
        error: {
          DEFAULT: '#EA4335',
          dark: '#D32F2F',
        },
      },
    },
  },
  plugins: [],
}
