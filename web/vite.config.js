import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: o site funciona tanto em /cnpj-alimentacao/ (GitHub Pages) quanto na raiz
  base: './',
});
