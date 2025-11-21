import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        strictPort: true,
      },
      plugins: [react()],
      base: './',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // 👇 ADDED FOR ELECTRON PRODUCTION BUILD FIX 👇
      build: {
        // Ensures assets are placed in the 'assets' subdirectory of 'dist'
        assetsDir: 'assets', 
        rollupOptions: {
            output: {
                // Explicitly define asset names to ensure they are relative 
                // and placed correctly inside the 'assets' directory.
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
      }
      // 👆 END OF NEW BUILD BLOCK 👆
    };
});