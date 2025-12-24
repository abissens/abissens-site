import styles from './author.module.scss';
import { Author } from '@/lib/posts';

interface AuthorComponentProps {
  author?: Author;
  className?: string;
}

export default function AuthorComponent({ author, className }: AuthorComponentProps) {
  if (author === undefined) {
    return null;
  }

  return (
    <div className={`${styles.author} ${className ?? ''}`}>
      <span className={styles.authorName}>{author.name}</span>
      <div className={styles.authorLinks}>
        {author.x && (
          <a
            href={author.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter) Profile"
          >
            <div className={styles.x}></div>
          </a>
        )}
        {author.email && (
          <a
            href={`mailto:${author.email}`}
            aria-label="Email"
          >
            <div className={styles.email}></div>
          </a>
        )}
        {author.github && (
          <a
            href={author.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
          >
            <div className={styles.github}></div>
          </a>
        )}
        {author.linkedin && (
          <a
            href={author.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
          >
            <div className={styles.linkedin}></div>
          </a>
        )}
        {author.substack && (
          <a
            href={author.substack}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Substack"
          >
            <div className={styles.substack}></div>
          </a>
        )}
      </div>
    </div>
  );
}
