/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        "btn-text": "var(--color-button-text)",
      },
      fontFamily: {
        site: "var(--font-family)",
      },
      borderRadius: {
        site: "var(--border-radius)",
      },
    },
  },
  plugins: [],
};
