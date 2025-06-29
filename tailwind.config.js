/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary IBD awareness colors
        ibd: {
          100: '#F3E8FF', // Light purple
          200: '#E4D0FF',
          300: '#D1B1FF',
          400: '#B388FF',
          500: '#9966CC', // Main IBD awareness purple
          600: '#7B4EAC',
          700: '#5E388C',
          800: '#42266C',
          900: '#2A1854'
        },
        // Complementary colors
        healing: {
          100: '#E8FFF3', // Mint/healing green
          200: '#D0FFE4',
          300: '#B1FFD1',
          400: '#88FFB3',
          500: '#66CC99'
        },
        comfort: {
          100: '#FFF3E8', // Warm/comforting orange
          200: '#FFE4D0',
          300: '#FFD1B1',
          400: '#FFB388',
          500: '#CC9966'
        },
        // Accent colors
        accent: {
          blue: '#4A90E2',  // Calming blue
          yellow: '#FFD700', // Hope yellow
          pink: '#FF69B4'    // Compassion pink
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(153, 102, 204, 0.5)'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}