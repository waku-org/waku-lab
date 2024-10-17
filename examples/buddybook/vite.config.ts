import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.WALLETCONNECT_PROJECT_ID': JSON.stringify(process.env.VITE_WALLETCONNECT_PROJECT_ID),
  }
})
