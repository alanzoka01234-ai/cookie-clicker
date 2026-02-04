import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Carrega variáveis de ambiente baseadas no modo atual (development/production)
    // O terceiro argumento '' permite carregar variáveis sem o prefixo VITE_
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Garante leitura segura das variáveis tanto do process.env (Vercel) quanto do arquivo .env (Local)
        'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve('./'),
        }
      }
    };
});