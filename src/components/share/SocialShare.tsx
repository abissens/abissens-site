'use client';

import { useState } from 'react';
import styles from './SocialShare.module.scss';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  socialUrls?: {
    twitter?: string;
    linkedin?: string;
  };
}

export default function SocialShare({ url, title, description, className, socialUrls }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description || title),
  };

  const shareLinks = {
    twitter: socialUrls?.twitter || `https://twitter.com/intent/tweet?url=${shareData.url}&text=${shareData.title}`,
    linkedin: socialUrls?.linkedin || `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}`,
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`${styles.socialShare} ${className || ''}`}>
      <span className={styles.shareLabel}>Share this article:</span>

      <div className={styles.shareButtons}>
        <button
          onClick={() => handleShare('twitter')}
          className={`${styles.shareButton} ${styles.twitter} ${socialUrls?.twitter ? styles.reshare : ''}`}
          aria-label={socialUrls?.twitter ? "Retweet on Twitter" : "Share on Twitter"}
          title={socialUrls?.twitter ? "Retweet existing post" : "Share on Twitter"}
        >
          <div className={styles.shareIcon}></div>
          <span className={styles.shareText}>{socialUrls?.twitter ? "Retweet" : "Twitter"}</span>
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className={`${styles.shareButton} ${styles.linkedin} ${socialUrls?.linkedin ? styles.reshare : ''}`}
          aria-label={socialUrls?.linkedin ? "Reshare on LinkedIn" : "Share on LinkedIn"}
          title={socialUrls?.linkedin ? "Reshare existing post" : "Share on LinkedIn"}
        >
          <div className={styles.shareIcon}></div>
          <span className={styles.shareText}>{socialUrls?.linkedin ? "Reshare" : "LinkedIn"}</span>
        </button>


        <button
          onClick={() => handleShare('copy')}
          className={`${styles.shareButton} ${styles.copy} ${copied ? styles.copied : ''}`}
          aria-label="Copy link"
          title={copied ? 'Link copied!' : 'Copy link'}
        >
          <div className={styles.shareIcon}></div>
          <span className={styles.shareText}>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
