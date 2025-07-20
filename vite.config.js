import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), vue()],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://apps2-int.mides.gub.uy', // URL del servidor SOAP
          changeOrigin: true, // Cambia el encabezado 'Origin' para que coincida con el objetivo
          rewrite: (path) => path.replace(/^\/api/, ''), // Elimina el prefijo '/api' en las solicitudes
          secure: false, // Si usas HTTPS con certificados autofirmados
        },
      },
    },
    define: {
      'process.env': env,
    },
  };
});
