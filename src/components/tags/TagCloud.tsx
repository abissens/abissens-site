import Link from 'next/link';
import styles from './TagCloud.module.scss';

interface TagWithCount {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tags: TagWithCount[];
  className?: string;
}

export default function TagCloud({ tags, className }: TagCloudProps) {
  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));

  const getSizeClass = (count: number) => {
    if (maxCount === minCount) return styles.medium;

    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio >= 0.8) return styles.xlarge;
    if (ratio >= 0.6) return styles.large;
    if (ratio >= 0.4) return styles.medium;
    if (ratio >= 0.2) return styles.small;
    return styles.xsmall;
  };

  return (
    <div className={`${styles.tagCloud} ${className || ''}`}>
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          className={`${styles.tag} ${getSizeClass(count)}`}
          title={`${count} post${count !== 1 ? 's' : ''}`}
        >
          {tag} ({count})
        </Link>
      ))}
    </div>
  );
}