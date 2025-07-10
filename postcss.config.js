// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // 이 부분이 핵심입니다.
    autoprefixer: {}, // autoprefixer가 필요하다면 추가합니다.
  },
};