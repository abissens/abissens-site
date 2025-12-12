'use client';

import { useShareActions, ShareConfig } from '@/hooks/useShareActions';
import styles from './FloatingSocialShare.module.scss';

type FloatingSocialShareProps = ShareConfig;

export default function FloatingSocialShare({ url, title, description, socialUrls }: FloatingSocialShareProps) {
  const { copied, handleShare, getAriaLabel, isReshare } = useShareActions({
    url,
    title,
    description,
    socialUrls,
  });

  return (
    <div className={styles.floatingSidebar}>
      <div className={styles.shareLabel}>Share</div>

      <button
        onClick={() => handleShare('twitter')}
        className={`${styles.shareButton} ${styles.twitter} ${isReshare('twitter') ? styles.reshare : ''}`}
        aria-label={getAriaLabel('twitter')}
        title={getAriaLabel('twitter')}
      >
        <div className={styles.shareIcon}></div>
      </button>

      <button
        onClick={() => handleShare('linkedin')}
        className={`${styles.shareButton} ${styles.linkedin} ${isReshare('linkedin') ? styles.reshare : ''}`}
        aria-label={getAriaLabel('linkedin')}
        title={getAriaLabel('linkedin')}
      >
        <div className={styles.shareIcon}></div>
      </button>

      <button
        onClick={() => handleShare('copy')}
        className={`${styles.shareButton} ${styles.copy} ${copied ? styles.copied : ''}`}
        aria-label={getAriaLabel('copy')}
        title={getAriaLabel('copy')}
      >
        <div className={styles.shareIcon}></div>
      </button>
    </div>
  );
}
