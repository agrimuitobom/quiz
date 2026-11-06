/** @type {import('tailwindcss').Config} */
module.exports = {
    // クラス名を拾うファイル。JS のテンプレート文字列内のクラスも対象にする
    content: ['./index.html', './js/**/*.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Noto Sans JP"', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    900: '#1e3a8a',
                }
            }
        }
    },
    plugins: [],
};
