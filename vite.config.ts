import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        const src = resolve(__dirname, 'public/_redirects');
        const destDir = resolve(__dirname, 'dist');
        const dest = resolve(destDir, '_redirects');
        
        // Ensure dist exists
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        
        try {
          copyFileSync(src, dest);
          console.log('✅ _redirects copied to dist');
        } catch (error) {
          // ✅ Fixed: Type assertion for error
          const err = error as Error;
          console.warn('⚠️ Could not copy _redirects:', err.message);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
  },
});