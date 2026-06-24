import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/utils/**/*.{js,jsx}',
        'src/components/ui/**/*.{js,jsx}',
        'src/context/**/*.{js,jsx}',
      ],
      exclude: ['**/node_modules/**', 'src/main.jsx'],
      thresholds: { lines: 60, functions: 60, branches: 40, statements: 60 },
    },
  },
});
