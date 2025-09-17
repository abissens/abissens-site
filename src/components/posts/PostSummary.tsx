import { ReactElement } from 'react';

interface PostSummaryProps {
  summary: string;
  className?: string;
}

function formatSummary(summary: string): ReactElement {
  const parts = summary.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index}>{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

export default function PostSummary({ summary, className }: PostSummaryProps) {
  return (
    <div className={className}>
      {formatSummary(summary || '')}
    </div>
  );
}
