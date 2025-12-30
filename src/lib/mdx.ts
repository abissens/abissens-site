/**
 * Shared MDX configuration for consistent rendering across the site.
 * Uses optimized highlight.js with only needed languages.
 */

import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import { lowlight } from './highlight';

// Rehype highlight with custom lowlight instance
const rehypeHighlightOptions = {
  lowlight,
  // Detect language even without explicit code fence language
  detect: true,
  // Add language class to code blocks
  prefix: 'hljs-',
};

// Rehype plugin to wrap tables in a responsive container
function rehypeResponsiveTables() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-responsive'] },
          children: [node],
        };
        (parent as Element).children[index] = wrapper;
      }
    });
  };
}

export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm] as PluggableList,
    rehypePlugins: [
      [rehypeHighlight, rehypeHighlightOptions],
      rehypeResponsiveTables,
    ] as PluggableList,
  },
};

export { lowlight };
