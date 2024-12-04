// vite.config.js
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import {defineConfig} from "vite";
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {TDesignResolver} from 'unplugin-vue-components/resolvers';
import { lazyImport, VxeResolver } from 'vite-plugin-lazy-import'
// @ts-ignore
import path from "path";

function _resolve(dir: string) {
// @ts-ignore
  return path.resolve(__dirname, dir);
}

export default defineConfig({
  resolve: {
    alias: {
      "@": _resolve("src")
    },
  },
  plugins: [
    vue(), vueJsx(),
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
      imports: ['vue', '@vueuse/core', 'vue-router']
    }),
    Components({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }),
    lazyImport({
      resolvers: [
        VxeResolver({
          libraryName: 'vxe-table'
        }),
      ]
    })
  ],
  base: "./",
  build: {
    outDir: "src-utools/dist",
    rollupOptions: {
      input: {
        main: _resolve('index.html'),
        controls: _resolve('controls.html'),
      },
    },
  },

});
