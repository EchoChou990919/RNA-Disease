import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import WindiCSS from "vite-plugin-windicss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    WindiCSS()
  ],
  esbuild:{
    pure: ["console.log"], minify: true
  },
  resolve:{
    alias:[
      {
        find:"@",
        replacement:"/src"
      },
    ]
  },
  build:{
    commonjsOptions:{
      ignoreTryCatch:false
    },
    rollupOptions:{
      output:{
        manualChunks:{
          nodelinks: ["lodash","/public/newNodeLinks.json"]
        }
      }
    }
  },
  json:{
    stringify:true
  }
})
