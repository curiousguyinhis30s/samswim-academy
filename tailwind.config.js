/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Calgee Ocean Blue - Deep, rich blues from packaging
        ocean: {
          50: '#EEF6FF',
          100: '#DCEEFF',
          200: '#B8DCFF',
          300: '#7CBEFF',
          400: '#3B9AE8',
          500: '#1E5AA8',  // Primary from image
          600: '#1A4D92',
          700: '#0D3A6B',  // Dark from image
          800: '#0A2D54',
          900: '#071F3B',
          950: '#041225',
        },
        // Calgee Algae Green - Fresh, vibrant greens
        algae: {
          50: '#EEFBF0',
          100: '#D8F5DC',
          200: '#B4EBBc',
          300: '#7DD191',  // Light from image
          400: '#4CB963',  // Primary from image
          500: '#2D8B4A',  // Dark from image
          600: '#237039',
          700: '#1C5A2E',
          800: '#164824',
          900: '#103619',
          950: '#082010',
        },
        // Coral/Starfish accent - Warm pops from fish
        coral: {
          50: '#FFF5F0',
          100: '#FFEADC',
          200: '#FFD4B8',
          300: '#FFB78A',
          400: '#FF7F50',  // Coral from image
          500: '#E85D3B',  // Starfish from image
          600: '#C44A2E',
          700: '#A13923',
          800: '#802D1C',
          900: '#5F2115',
          950: '#3D140D',
        },
        // Neutral slate for text
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',  // From image
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(30, 90, 168, 0.08)',
        'medium': '0 4px 16px 0 rgba(30, 90, 168, 0.12)',
        'strong': '0 8px 32px 0 rgba(30, 90, 168, 0.16)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
