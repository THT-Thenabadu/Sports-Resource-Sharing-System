import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/booking/**/*.{js,ts,jsx,tsx,mdx}',
    './app/booking/components/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#112240',
        accent: '#64FFDA',
        dark: '#0A192F',
      },
    },
  },
  plugins: [],
};

export default config;

