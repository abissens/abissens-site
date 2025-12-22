import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxOptions } from '@/lib/mdx';
import { MDXErrorBoundary, MDXErrorFallback } from '@/components/error/MDXErrorBoundary';
import type { MDXComponents } from 'mdx/types';

interface SafeMDXContentProps {
  content: string;
  components?: MDXComponents;
}

async function MDXContent({ content, components }: SafeMDXContentProps) {
  try {
    return (
      <MDXRemote
        source={content}
        options={mdxOptions}
        components={components}
      />
    );
  } catch (error) {
    console.error('MDX rendering error:', error);
    return (
      <MDXErrorFallback
        message={
          process.env.NODE_ENV === 'development'
            ? `MDX Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            : undefined
        }
      />
    );
  }
}

export default function SafeMDXContent({ content, components }: SafeMDXContentProps) {
  return (
    <MDXErrorBoundary>
      <MDXContent content={content} components={components} />
    </MDXErrorBoundary>
  );
}
