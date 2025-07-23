/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'neu-bg': '#e0e0e0', // Main background color
          'neu-light': '#ffffff', // Light shadow color
          'neu-dark': '#bebebe',  // Dark shadow color
        },
        boxShadow: {
          'neu-outset': '7px 7px 15px #bebebe, -7px -7px 15px #ffffff',
          'neu-inset': 'inset 7px 7px 15px #bebebe, inset -7px -7px 15px #ffffff',
          'neu-outset-sm': '4px 4px 8px #bebebe, -4px -4px 8px #ffffff',
          'neu-inset-sm': 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff',
        },
      },
    },
    plugins: [],
  }