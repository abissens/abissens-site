'use client';

import Link from 'next/link';
import { Author, PostData } from '@/lib/posts';
import { useRoutes } from '@/components/providers/RouteContext';
import { useShareActions } from '@/hooks/useShareActions';
import styles from './PostFooter.module.scss';

interface PostFooterProps {
  author?: Author;
  prevPost: PostData | null;
  nextPost: PostData | null;
  gitUrl?: string;
  shareUrl?: string;
  shareTitle?: string;
  shareDescription?: string;
  socialUrls?: {
    x?: string;
    linkedin?: string;
    git?: string;
  };
}

export default function PostFooter({
  author,
  prevPost,
  nextPost,
  gitUrl,
  shareUrl,
  shareTitle,
  shareDescription,
  socialUrls
}: PostFooterProps) {
  const { paths } = useRoutes();
  const { copied, handleShare, getAriaLabel, isReshare } = useShareActions({
    url: shareUrl || '',
    title: shareTitle || '',
    description: shareDescription || '',
    socialUrls,
  });

  const hasShare = shareUrl && shareTitle;

  return (
    <footer className={styles.postFooter}>
      {/* Mobile share section - only visible on small screens */}
      {hasShare && (
        <div className={styles.mobileShare}>
          <span className={styles.mobileShareLabel}>Share</span>
          <div className={styles.mobileShareButtons}>
            <button
              onClick={() => handleShare('x')}
              className={`${styles.shareBtn} ${isReshare('x') ? styles.reshare : ''}`}
              aria-label={getAriaLabel('x')}
            >
              <span className={styles.shareIcon} data-icon="x" />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className={`${styles.shareBtn} ${isReshare('linkedin') ? styles.reshare : ''}`}
              aria-label={getAriaLabel('linkedin')}
            >
              <span className={styles.shareIcon} data-icon="linkedin" />
            </button>
            <button
              onClick={() => handleShare('copy')}
              className={`${styles.shareBtn} ${copied ? styles.copied : ''}`}
              aria-label={getAriaLabel('copy')}
            >
              <span className={styles.shareIcon} data-icon={copied ? 'check' : 'link'} />
            </button>
          </div>
        </div>
      )}

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
          {gitUrl && (
            <a href={gitUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceCodeLink}>
              <span className={styles.sourceCodeIcon} />
              <span>View source code</span>
            </a>
          )}
        </div>
      )}

      {!author && gitUrl && (
        <div className={styles.sourceCodeOnly}>
          <a href={gitUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceCodeLink}>
            <span className={styles.sourceCodeIcon} />
            <span>View source code</span>
          </a>
        </div>
      )}

      <nav className={styles.postNav}>
        <div className={styles.navItem}>
          {prevPost && (
            <Link href={paths.blogPost(prevPost.slug)} className={styles.navLink}>
              <span className={styles.navLabel}>Previous</span>
              <span className={styles.navTitle}>{prevPost.title}</span>
            </Link>
          )}
        </div>

        <div className={`${styles.navItem} ${styles.navItemNext}`}>
          {nextPost && (
            <Link href={paths.blogPost(nextPost.slug)} className={styles.navLink}>
              <span className={styles.navLabel}>Next</span>
              <span className={styles.navTitle}>{nextPost.title}</span>
            </Link>
          )}
        </div>
      </nav>
    </footer>
  );
}
