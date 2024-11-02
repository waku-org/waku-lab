import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_WALLETCONNECT_PROJECT_ID%/g,
            env.VITE_WALLETCONNECT_PROJECT_ID || ''
          )
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
        process: 'process/browser',
      },
    },
    build: {
      assetsDir: 'assets',
      manifest: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    define: {
      global: 'globalThis',
      'process.env.VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLETCONNECT_PROJECT_ID),
      'process': {
        'env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          'DEBUG': JSON.stringify(process.env.DEBUG),
          'VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLETCONNECT_PROJECT_ID)
        },
        'nextTick': 'setImmediate',
        'platform': JSON.stringify('browser'),
        'version': JSON.stringify('v16.0.0'),
        'browser': true
      },
    }
  }
})
