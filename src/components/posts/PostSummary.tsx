import { ReactElement } from 'react';

interface PostSummaryProps {
  summary: string;
  className?: string;
}

function formatSummary(summary: string): ReactElement {
  // Standard markdown: blank line = paragraph, two trailing spaces = <br>
  const paragraphs = summary.split(/\n\s*\n/);

  return (
    <>
      {paragraphs.map((para, paraIndex) => {
        // Handle two trailing spaces as line breaks within paragraph
        const lines = para.split(/  \n/);

        return (
          <p key={paraIndex}>
            {lines.map((line, lineIndex) => {
              // Join single newlines (standard markdown ignores them)
              const text = line.replace(/\n/g, ' ');
              const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

              return (
                <span key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {parts.map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('*') && part.endsWith('*')) {
                      return <em key={partIndex}>{part.slice(1, -1)}</em>;
                    }
                    if (part.startsWith('`') && part.endsWith('`')) {
                      return <code key={partIndex}>{part.slice(1, -1)}</code>;
                    }
                    return part;
                  })}
                </span>
              );
            })}
          </p>
        );
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
