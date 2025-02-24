/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      maxWidth: {
        '15xl': '2400px', // Custom max width
      },
    },
  },
  plugins: [typography],
};

export default config;
