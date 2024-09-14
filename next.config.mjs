/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);
const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default withMDX({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    output: 'export',
    trailingSlash: true,
    sassOptions: {
        includePaths: [join(__dirname, 'styles')],
    },
});
