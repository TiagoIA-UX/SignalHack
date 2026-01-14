/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
      mono: ["var(--font-geist-mono)", "monospace"],
    },
    fontSize: {
      base: ["18px", { lineHeight: "1.6" }],
      sm: ["16px", { lineHeight: "1.6" }],
      lg: ["20px", { lineHeight: "1.6" }],
      xl: ["24px", { lineHeight: "1.5" }],
      "2xl": ["32px", { lineHeight: "1.5" }],
      "3xl": ["36px", { lineHeight: "1.5" }],
    },
    extend: {
      spacing: {
        'card': '2rem',
        'cta': '1.5rem',
      },
      colors: {
        'premium-bg': '#0a0a0a',
        'premium-card': 'rgba(24, 24, 27, 0.95)',
      },
      borderRadius: {
        'card': '1.25rem',
      },
    },
  },
  plugins: [],
}