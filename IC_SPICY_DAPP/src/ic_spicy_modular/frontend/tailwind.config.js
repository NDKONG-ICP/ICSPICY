module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#181c24',
          dark: '#23272f',
        },
        accent: {
          purple: '#a18aff',
          teal: '#5eead4',
          orange: '#ffd580',
          yellow: '#ffe066',
          soft: '#bfc9d1',
        },
        card: {
          DEFAULT: '#23272f',
          soft: '#23272f',
        },
      },
      backgroundImage: {
        'spicy-gradient': 'linear-gradient(135deg, #23272f 0%, #181c24 100%)',
        'spicy-accent': 'linear-gradient(90deg, #a18aff 0%, #5eead4 100%)',
      },
      boxShadow: {
        'soft': '0 2px 16px 0 rgba(30, 41, 59, 0.12)',
      },
      borderRadius: {
        'xl': '1.25rem',
      },
    },
  },
  plugins: [],
}; 