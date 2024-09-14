'use client';

import { useState, useEffect } from 'react';
import styles from './FloatingSocialShare.module.scss';

interface FloatingSocialShareProps {
  url: string;
  title: string;
  description?: string;
  socialUrls?: {
    twitter?: string;
    linkedin?: string;
  };
}

export default function FloatingSocialShare({ url, title, description, socialUrls }: FloatingSocialShareProps) {
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
    <>
      {/* Desktop floating sidebar - always visible */}
      <div className={styles.floatingSidebar}>
        <div className={styles.shareLabel}>Share</div>

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

      {/* Mobile inline share section */}
      <div className={styles.mobileShareSection}>
        <div className={styles.mobileShareContent}>
          <span className={styles.mobileShareLabel}>Share this article</span>

          <div className={styles.mobileShareButtons}>
            <button
              onClick={() => handleShare('twitter')}
              className={`${styles.mobileShareButton} ${styles.twitter} ${socialUrls?.twitter ? styles.reshare : ''}`}
              aria-label={socialUrls?.twitter ? "Retweet" : "Share on Twitter"}
            >
              <div className={styles.shareIcon}></div>
              <span className={styles.buttonText}>{socialUrls?.twitter ? "Retweet" : "Twitter"}</span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className={`${styles.mobileShareButton} ${styles.linkedin} ${socialUrls?.linkedin ? styles.reshare : ''}`}
              aria-label={socialUrls?.linkedin ? "Reshare" : "Share on LinkedIn"}
            >
              <div className={styles.shareIcon}></div>
              <span className={styles.buttonText}>{socialUrls?.linkedin ? "Reshare" : "LinkedIn"}</span>
            </button>

            <button
              onClick={() => handleShare('copy')}
              className={`${styles.mobileShareButton} ${styles.copy} ${copied ? styles.copied : ''}`}
              aria-label={copied ? 'Copied!' : 'Copy link'}
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
