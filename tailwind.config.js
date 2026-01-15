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
      // Design tokens (spacing base = 8px)
      spacing: {
        '1': '0.25rem', // 4px
        '2': '0.5rem',  // 8px
        '3': '0.75rem', // 12px
        '4': '1rem',    // 16px
        '6': '1.5rem',  // 24px
        '8': '2rem',    // 32px
        '12': '3rem',   // 48px
        'card': '2rem',
        'cta': '1.5rem',
      },
      // Max sizes and density controls
      maxHeight: {
        'card': '420px',
      },
      colors: {
        'premium-bg': '#0a0a0a',
        'premium-card': 'rgba(24, 24, 27, 0.95)',
      },
      borderRadius: {
        'card': '1.25rem',
      },
      zIndex: {
        'drawer': '1100',
      }
    },
  },
  plugins: [],
}