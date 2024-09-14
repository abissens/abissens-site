## Abissens site 


### Scaffolding 

```shell
npx create-next-app@latest
# What is your project named? abissens-site
# Would you like to use TypeScript?  Yes
# Would you like to use ESLint?  Yes
# Would you like to use Tailwind CSS? No
# Would you like your code inside a `src/` directory?  Yes
# Would you like to use App Router? (recommended)  Yes
# Would you like to use Turbopack for `next dev`?  No / Yes
# Would you like to customize the import alias (`@/*` by default)? No

npm install @next/mdx @mdx-js/loader next-mdx-remote gray-matter remark remark-html 
npm install --save-dev sass
# Edit next.config.mjs

# Initial structure (check commit)

npm run build
```

#### next.config.mjs
```typescript
/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/
});

export default withMDX({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    output: 'export', 
    trailingSlash: true,
});
```
