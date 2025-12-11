'use client';

import { useShareActions, ShareConfig } from '@/hooks/useShareActions';
import styles from './SocialShare.module.scss';

interface SocialShareProps extends ShareConfig {
  className?: string;
}

export default function SocialShare({ url, title, description, className, socialUrls }: SocialShareProps) {
  const { copied, handleShare, getAriaLabel, getButtonLabel, isReshare } = useShareActions({
    url,
    title,
    description,
    socialUrls,
  });

  return (
    <div className={`${styles.socialShare} ${className || ''}`}>
      <span className={styles.shareLabel}>Share this article:</span>

      <div className={styles.shareButtons}>
        <button
          onClick={() => handleShare('twitter')}
          className={`${styles.shareButton} ${styles.twitter} ${isReshare('twitter') ? styles.reshare : ''}`}
          aria-label={getAriaLabel('twitter')}
          title={getAriaLabel('twitter')}
        >
          <div className={styles.shareIcon}></div>
          <span className={styles.shareText}>
            {getButtonLabel('twitter', isReshare('twitter') ? 'reshare' : 'share')}
          </span>
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className={`${styles.shareButton} ${styles.linkedin} ${isReshare('linkedin') ? styles.reshare : ''}`}
          aria-label={getAriaLabel('linkedin')}
          title={getAriaLabel('linkedin')}
        >
          <div className={styles.shareIcon}></div>
          <span className={styles.shareText}>
            {getButtonLabel('linkedin', isReshare('linkedin') ? 'reshare' : 'share')}
          </span>
        </button>

        <button
          onClick={() => handleShare('copy')}
          className={`${styles.shareButton} ${styles.copy} ${copied ? styles.copied : ''}`}
          aria-label={getAriaLabel('copy')}
          title={getAriaLabel('copy')}
        >
          <div className={styles.shareIcon}></div>
          <span className={styles.shareText}>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
