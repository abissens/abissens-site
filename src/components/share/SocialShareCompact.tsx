'use client';

import { useState } from 'react';
import styles from './SocialShareCompact.module.scss';

interface SocialShareCompactProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  socialUrls?: {
    twitter?: string;
    linkedin?: string;
  };
}

export default function SocialShareCompact({ url, title, description, className, socialUrls }: SocialShareCompactProps) {
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
    <div className={`${styles.socialShareCompact} ${className || ''}`}>
      <button
        onClick={() => handleShare('twitter')}
        className={`${styles.shareButton} ${styles.twitter} ${socialUrls?.twitter ? styles.reshare : ''}`}
        aria-label={socialUrls?.twitter ? "Retweet on Twitter" : "Share on Twitter"}
        title={socialUrls?.twitter ? "Retweet existing post" : "Share on Twitter"}
      >
        <div className={styles.shareIcon}></div>
      </button>

      <button
        onClick={() => handleShare('linkedin')}
        className={`${styles.shareButton} ${styles.linkedin} ${socialUrls?.linkedin ? styles.reshare : ''}`}
        aria-label={socialUrls?.linkedin ? "Reshare on LinkedIn" : "Share on LinkedIn"}
        title={socialUrls?.linkedin ? "Reshare existing post" : "Share on LinkedIn"}
      >
        <div className={styles.shareIcon}></div>
      </button>


      <button
        onClick={() => handleShare('copy')}
        className={`${styles.shareButton} ${styles.copy} ${copied ? styles.copied : ''}`}
        aria-label="Copy link"
        title={copied ? 'Link copied!' : 'Copy link'}
      >
        <div className={styles.shareIcon}></div>
      </button>
    </div>
  );
}
