import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
    // CSS optimization for production
    ...(process.env.NODE_ENV === 'production' ? [
      cssnano({
        preset: ['default', {
          // Preserve important comments
          discardComments: {
            removeAll: false,
          },
          // Optimize CSS for better compression
          normalizeWhitespace: true,
          minifyFontValues: true,
          minifySelectors: true,
          // Preserve CSS custom properties (CSS variables)
          normalizeUnicode: false,
          // Preserve calc() expressions
          calc: false,
          // Preserve z-index values
          zindex: false,
        }]
      })
    ] : []),
  ],
}