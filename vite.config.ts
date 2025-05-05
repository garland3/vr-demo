import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: true, // Expose to all network interfaces
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Make all environment variables available to the application
    define: {
      'import.meta.env.GROQ_API': JSON.stringify(env.GROQ_API),
      'import.meta.env.VITE_DEFAULT_AI_PROMPT': JSON.stringify(env.DEFAULT_AI_PROMPT),
    },
  };
});
