/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ── Semantic tokens backed by CSS custom properties ──────────────
      // Set by [data-theme="..."] selectors in index.css
      colors: {
        layer: {
          0: 'var(--bg0)',   // page background
          1: 'var(--bg1)',   // panel / topbar / sidebar
          2: 'var(--bg2)',   // input fields, raised surfaces
          3: 'var(--bg3)',   // hover states
          4: 'var(--bg4)',   // scrollbar thumbs
        },
        ink: {
          DEFAULT: 'var(--text0)',  // primary text
          2: 'var(--text1)',        // secondary text
          3: 'var(--text2)',        // tertiary / dim text
        },
        edge: {
          DEFAULT: 'var(--border)',        // subtle border
          strong: 'var(--border2)',        // emphasized border
        },
        accent: {
          DEFAULT: 'var(--accent)',        // accent color
          dim: 'var(--accent-dim)',        // accent background tint
          glow: 'var(--accent-glow)',      // accent glow / focus ring
        },
        // ── Fixed HTTP method colors ───────────────────────────────────
        method: {
          get:    '#5dbd7a',
          post:   '#5ab4d8',
          put:    '#e09a4d',
          patch:  '#9d7fe0',
          delete: '#cc5c5c',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      height: {
        topbar:    '46px',
        statusbar: '22px',
      },
      width: {
        sidebar: '236px',
      },
    },
  },
  plugins: [],
}
