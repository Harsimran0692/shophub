import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
// import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [tailwindcss()],
});
