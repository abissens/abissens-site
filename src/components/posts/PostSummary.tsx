'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostSummaryProps {
  summary: string;
  className?: string;
}

export default function PostSummary({ summary, className }: PostSummaryProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <>{children}</>,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          code: ({ children }) => <code>{children}</code>,
        }}
      >
        {summary || ''}
      </ReactMarkdown>
    </div>
  );
}
