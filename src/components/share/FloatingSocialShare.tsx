'use client';

import { useShareActions, ShareConfig } from '@/hooks/useShareActions';
import styles from './FloatingSocialShare.module.scss';

type FloatingSocialShareProps = ShareConfig;

export default function FloatingSocialShare({ url, title, description, socialUrls }: FloatingSocialShareProps) {
  const { copied, handleShare, getAriaLabel, getButtonLabel, isReshare } = useShareActions({
    url,
    title,
    description,
    socialUrls,
  });

  return (
    <>
      {/* Desktop floating sidebar - always visible */}
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

      {/* Mobile inline share section */}
      <div className={styles.mobileShareSection}>
        <div className={styles.mobileShareContent}>
          <span className={styles.mobileShareLabel}>Share this article</span>

          <div className={styles.mobileShareButtons}>
            <button
              onClick={() => handleShare('twitter')}
              className={`${styles.mobileShareButton} ${styles.twitter} ${isReshare('twitter') ? styles.reshare : ''}`}
              aria-label={getAriaLabel('twitter')}
            >
              <div className={styles.shareIcon}></div>
              <span className={styles.buttonText}>
                {getButtonLabel('twitter', isReshare('twitter') ? 'reshare' : 'share')}
              </span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className={`${styles.mobileShareButton} ${styles.linkedin} ${isReshare('linkedin') ? styles.reshare : ''}`}
              aria-label={getAriaLabel('linkedin')}
            >
              <div className={styles.shareIcon}></div>
              <span className={styles.buttonText}>
                {getButtonLabel('linkedin', isReshare('linkedin') ? 'reshare' : 'share')}
              </span>
            </button>

            <button
              onClick={() => handleShare('copy')}
              className={`${styles.mobileShareButton} ${styles.copy} ${copied ? styles.copied : ''}`}
              aria-label={getAriaLabel('copy')}
            >
              <div className={styles.shareIcon}></div>
              <span className={styles.buttonText}>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
