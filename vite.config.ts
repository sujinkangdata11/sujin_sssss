import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      build: {
        outDir: 'dist'
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        headers: {
          'Content-Security-Policy': ''
        },
        middlewareMode: false
      },
      assetsInclude: ['**/*.txt', '**/*.xml'],
      publicDir: 'public'
    };
});
// Force rebuild Tue Aug 19 20:10:59 KST 2025
// Force rebuild 1755605344
