'use client';

import Link from 'next/link';
import { useRoutes } from '@/components/providers/RouteContext';
import styles from './TagList.module.scss';

interface TagListProps {
  tags: string[];
  className?: string;
  showLinks?: boolean;
}

export default function TagList({ tags, className, showLinks = false }: TagListProps) {
  const { paths } = useRoutes();

  if (tags.length === 0) return null;

  return (
    <div className={`${styles.tagList} ${className || ''}`}>
      {tags.map(tag => (
        showLinks ? (
          <Link
            key={tag}
            href={paths.tag(tag)}
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
