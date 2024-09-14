import Link from 'next/link';
import styles from './TagList.module.scss';

interface TagListProps {
  tags: string[];
  className?: string;
  showLinks?: boolean;
}

export default function TagList({ tags, className, showLinks = false }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={`${styles.tagList} ${className || ''}`}>
      {tags.map(tag => (
        showLinks ? (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className={styles.tag}
          >
            #{tag}
          </Link>
        ) : (
          <span key={tag} className={styles.tag}>
            #{tag}
          </span>
        )
      ))}
    </div>
  );
}