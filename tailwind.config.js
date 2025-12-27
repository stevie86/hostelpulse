/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        modern:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('tailwindcss-animate'),
  ],
  daisyui: {
    themes: [
      {
        corporate: {
          primary: '#6366f1',
          'primary-content': '#ffffff',
          secondary: '#ec4899',
          'secondary-content': '#ffffff',
          accent: '#14b8a6',
          'accent-content': '#ffffff',
          neutral: '#171717',
          'neutral-content': '#fafafa',
          'base-100': '#ffffff',
          'base-200': '#f4f4f5',
          'base-300': '#e4e4e7',
          'base-content': '#18181b',
          info: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      {
        night: {
          primary: '#818cf8',
          'primary-content': '#ffffff',
          secondary: '#f472b6',
          'secondary-content': '#ffffff',
          accent: '#2dd4bf',
          'accent-content': '#000000',
          neutral: '#1e293b',
          'neutral-content': '#f8fafc',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'base-content': '#f1f5f9',
          info: '#22d3ee',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#fb7185',
        },
      },
    ],
    darkTheme: 'night',
  },
};
