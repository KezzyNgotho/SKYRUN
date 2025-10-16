import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@stacks/connect',
      '@stacks/transactions', 
      '@stacks/network',
      '@stacks/auth'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})