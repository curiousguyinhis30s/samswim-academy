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
        // Modern Teal - Bold, vibrant primary
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',  // Vibrant teal
          500: '#14B8A6',  // Primary
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        // Turquoise - Fresh ocean accent
        turquoise: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',  // Bright turquoise
          500: '#06B6D4',  // Primary
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
          950: '#083344',
        },
        // Ocean Blue - Deep, rich blue
        ocean: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',  // Primary blue
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        // Aqua - Gradient accent for CTAs
        aqua: {
          50: '#F0FFFF',
          100: '#E0FFFF',
          200: '#B0FFFF',
          300: '#7DF9FF',  // Electric blue
          400: '#40E0D0',  // Turquoise
          500: '#00CED1',  // Dark turquoise
          600: '#00B4B4',
          700: '#009999',
          800: '#007A7A',
          900: '#005C5C',
          950: '#003D3D',
        },
        // Coral accent - Warm pop for alerts/CTAs
        coral: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',  // Orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Emerald success - Fresh green
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',  // Primary success
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // Slate - Neutral text & backgrounds
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(20, 184, 166, 0.08)',
        'medium': '0 4px 16px 0 rgba(20, 184, 166, 0.12)',
        'strong': '0 8px 32px 0 rgba(20, 184, 166, 0.16)',
        'glow': '0 0 20px rgba(34, 211, 238, 0.3)',
        'glow-teal': '0 0 30px rgba(20, 184, 166, 0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 10px 20px -5px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 40px -10px rgba(20, 184, 166, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, #0D9488 0%, #0891B2 50%, #2563EB 100%)',
        'gradient-teal': 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
        'gradient-aqua': 'linear-gradient(135deg, #22D3EE 0%, #2DD4BF 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        'gradient-hero': 'linear-gradient(135deg, #134E4A 0%, #164E63 50%, #172554 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
