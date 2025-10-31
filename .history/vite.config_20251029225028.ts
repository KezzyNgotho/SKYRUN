import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ protocolImports: true })
  ],
  optimizeDeps: {
    include: [
      '@stacks/connect',
      '@stacks/transactions', 
      '@stacks/network',
      '@stacks/auth',
      '@hashgraph/sdk'
    ]
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})