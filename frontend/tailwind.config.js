/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // ✅ src 폴더 안의 모든 tsx 파일을 감시한다는 뜻입니다.
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          point: '#3B82F6',
        },
      },
    },
  },
  plugins: [],
};
