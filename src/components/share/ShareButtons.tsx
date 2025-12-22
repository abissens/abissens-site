'use client';

import { useShareActions, ShareConfig } from '@/hooks/useShareActions';
import styles from './ShareButtons.module.scss';

export type ShareVariant = 'floating' | 'inline' | 'compact';

interface ShareButtonsProps extends ShareConfig {
  variant?: ShareVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export default function ShareButtons({
  url,
  title,
  description,
  socialUrls,
  variant = 'inline',
  showLabel = true,
  label = 'Share',
  className,
}: ShareButtonsProps) {
  const { copied, handleShare, getAriaLabel, getButtonLabel, isReshare } = useShareActions({
    url,
    title,
    description,
    socialUrls,
  });

  const containerClass = `${styles.shareButtons} ${styles[variant]} ${className || ''}`;
  const showText = variant === 'inline';

  return (
    <div className={containerClass}>
      {showLabel && (
        <span className={styles.shareLabel}>
          {variant === 'inline' ? `${label} this article:` : label}
        </span>
      )}

      <div className={styles.buttons}>
        <button
          onClick={() => handleShare('x')}
          className={`${styles.shareButton} ${styles.x} ${isReshare('x') ? styles.reshare : ''}`}
          aria-label={getAriaLabel('x')}
          title={getAriaLabel('x')}
        >
          <span className={styles.shareIcon} />
          {showText && (
            <span className={styles.shareText}>
              {getButtonLabel('x', isReshare('x') ? 'reshare' : 'share')}
            </span>
          )}
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className={`${styles.shareButton} ${styles.linkedin} ${isReshare('linkedin') ? styles.reshare : ''}`}
          aria-label={getAriaLabel('linkedin')}
          title={getAriaLabel('linkedin')}
        >
          <span className={styles.shareIcon} />
          {showText && (
            <span className={styles.shareText}>
              {getButtonLabel('linkedin', isReshare('linkedin') ? 'reshare' : 'share')}
            </span>
          )}
        </button>

        <button
          onClick={() => handleShare('copy')}
          className={`${styles.shareButton} ${styles.copy} ${copied ? styles.copied : ''}`}
          aria-label={getAriaLabel('copy')}
          title={getAriaLabel('copy')}
        >
          <span className={styles.shareIcon} />
          {showText && (
            <span className={styles.shareText}>
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// Re-export for backwards compatibility
export { ShareButtons as FloatingSocialShare };
export { ShareButtons as SocialShare };
export { ShareButtons as SocialShareCompact };
