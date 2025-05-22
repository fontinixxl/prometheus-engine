/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#1e1e1e',
          panel: '#252526',
          header: '#323233',
          border: '#3f3f3f',
          text: '#cccccc',
          highlight: '#0078d4',
          selection: 'rgba(0, 120, 212, 0.4)',
        },
      },
    },
  },
  plugins: [],
};
