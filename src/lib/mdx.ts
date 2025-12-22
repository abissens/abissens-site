/**
 * Shared MDX configuration for consistent rendering across the site.
 * Uses optimized highlight.js with only needed languages.
 */

import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';
import { lowlight } from './highlight';

// Rehype highlight with custom lowlight instance
const rehypeHighlightOptions = {
  lowlight,
  // Detect language even without explicit code fence language
  detect: true,
  // Add language class to code blocks
  prefix: 'hljs-',
};

export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm] as PluggableList,
    rehypePlugins: [[rehypeHighlight, rehypeHighlightOptions]] as PluggableList,
  },
};

export { lowlight };
