/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const require = createRequire(import.meta.url);
const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/
});
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    output: 'export',
    trailingSlash: true,
    poweredByHeader: false,
    generateEtags: false,
    sassOptions: {
        includePaths: [join(__dirname, 'styles')],
    },
    images: {
        unoptimized: true // Required for static export
    },
    experimental: {
        optimizePackageImports: ['highlight.js']
    }
};

export default withBundleAnalyzer(withMDX(nextConfig));
