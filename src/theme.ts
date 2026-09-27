import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50:  { value: '#e3f2fd' },
          500: { value: '#2196f3' },
          600: { value: '#1976d2' },
          700: { value: '#1565c0' },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: '#f0f2f5',
    },
  },
})

export const system = createSystem(defaultConfig, config)