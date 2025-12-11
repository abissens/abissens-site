import Link from 'next/link';
import { Author, PostData } from '@/lib/posts';
import styles from './PostFooter.module.scss';

interface PostFooterProps {
  author?: Author;
  prevPost: PostData | null;
  nextPost: PostData | null;
}

export default function PostFooter({ author, prevPost, nextPost }: PostFooterProps) {
  return (
    <footer className={styles.postFooter}>
      <div className={styles.divider} />

      {author && (
        <div className={styles.authorCard}>
          <span className={styles.writtenBy}>Written by</span>
          <span className={styles.authorName}>{author.name}</span>
          <div className={styles.authorLinks}>
            {author.x && (
              <a href={author.x} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <span className={styles.linkIcon} data-icon="x" />
              </a>
            )}
            {author.github && (
              <a href={author.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <span className={styles.linkIcon} data-icon="github" />
              </a>
            )}
            {author.linkedin && (
              <a href={author.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <span className={styles.linkIcon} data-icon="linkedin" />
              </a>
            )}
            {author.email && (
              <a href={`mailto:${author.email}`} aria-label="Email">
                <span className={styles.linkIcon} data-icon="email" />
              </a>
            )}
          </div>
        </div>
      )}

      <nav className={styles.postNav}>
        <div className={styles.navItem}>
          {prevPost && (
            <Link href={`/blog/${prevPost.slug}`} className={styles.navLink}>
              <span className={styles.navLabel}>← Previous</span>
              <span className={styles.navTitle}>{prevPost.title}</span>
            </Link>
          )}
        </div>

        <div className={`${styles.navItem} ${styles.navItemNext}`}>
          {nextPost && (
            <Link href={`/blog/${nextPost.slug}`} className={styles.navLink}>
              <span className={styles.navLabel}>Next →</span>
              <span className={styles.navTitle}>{nextPost.title}</span>
            </Link>
          )}
        </div>
      </nav>
    </footer>
  );
}
