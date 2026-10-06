import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import markdown from './plugins/vite-plugin-markdown'
import contentImages from './plugins/vite-plugin-content-images'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import matter from 'gray-matter'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [
    react(),
    markdown(),
    contentImages(),
    {
      name: 'spa-fallback-postbuild',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist')
        const entry = resolve(outDir, 'index.html')
        if (!existsSync(entry)) return
        copyFileSync(entry, resolve(outDir, '404.html'))
        writeFileSync(resolve(outDir, '.nojekyll'), '')

        // Pages serves these routes directly instead of returning the SPA as a 404.
        const site = JSON.parse(readFileSync(resolve(__dirname, 'content/site.json'), 'utf8'))
        const routes = new Set<string>()
        for (const route of ['publications', 'projects', 'experience', 'articles']) {
          if (site.features[route]) routes.add(route)
        }
        if (site.features.articles) {
          for (const languageRoot of ['content', 'content/zh']) {
            const folder = resolve(__dirname, languageRoot, 'articles')
            if (!existsSync(folder)) continue
            for (const name of readdirSync(folder).filter(name => name.endsWith('.md'))) {
              const { data } = matter(readFileSync(resolve(folder, name), 'utf8'))
              if (data.draft) continue
              if (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
                throw new Error(`Invalid public article slug: ${name}`)
              }
              routes.add(`articles/${data.slug}`)
            }
          }
        }
        for (const route of routes) {
          const folder = resolve(outDir, route)
          mkdirSync(folder, { recursive: true })
          copyFileSync(entry, resolve(folder, 'index.html'))
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@content/zh': resolve(__dirname, 'content/zh'),
      '@content': resolve(__dirname, 'content'),
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
