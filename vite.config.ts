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
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // Make all environment variables available to the application
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
    },
  };
});
