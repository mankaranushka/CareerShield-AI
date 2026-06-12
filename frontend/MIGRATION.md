# Frontend Component Migration & Configuration Guide

This guide details the setup and configuration changes made to support custom UI components, TypeScript, Tailwind CSS, and alias imports in this React/Vite project.

## 1. Directory Structure

We have established the standard `/src/components/ui` folder for reusable primitive components:
- `/src/components/ui/button.tsx`
- `/src/components/ui/input.tsx`
- `/src/components/ui/label.tsx`
- `/src/components/ui/sign-up.tsx`
- `/src/components/ui/demo.tsx`

Additionally, `/src/lib/utils.ts` contains the `cn` utility function.

### Why is `/src/components/ui` important?
By following the standard Shadcn UI conventions, we can easily paste or generate Radix-based components. This ensures modular styling, clean architecture, and easy integration with Tailwind CSS.

---

## 2. Path Alias Configuration (`@/`)

We configured the `@/` path alias to resolve imports relative to the `src` directory.

### Vite Config (`vite.config.js`)
We updated `vite.config.js` to include the alias mapping:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  ...
})
```

---

## 3. TypeScript Support (`tsconfig.json`)

To enable IDE support and prevent linting or compiler complaints regarding path mappings (`@/*`) and `.tsx` files in a JS-based project, we added a `tsconfig.json` at the root of `frontend/`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 4. Dependencies Configuration

Ensure you have the following packages installed in your `frontend` directory:
- `@radix-ui/react-slot` (for asChild Button polymorphism)
- `@radix-ui/react-label` (for customizable Labels)
- `class-variance-authority` (for defining styling variants)
- `clsx` & `tailwind-merge` (for dynamic class name construction and merging)
- `typescript` & `@types/react` & `@types/react-dom` (for TypeScript definitions and JSX typing)

To install all needed packages:
```bash
cd frontend
npm install @radix-ui/react-slot @radix-ui/react-label class-variance-authority clsx tailwind-merge
npm install -D typescript @types/react @types/react-dom
```
