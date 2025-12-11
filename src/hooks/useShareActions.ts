'use client';

import { useState, useCallback, useMemo } from 'react';

export interface ShareConfig {
  url: string;
  title: string;
  description?: string;
  socialUrls?: {
    twitter?: string;
    linkedin?: string;
  };
}

export interface ShareActions {
  copied: boolean;
  shareLinks: {
    twitter: string;
    linkedin: string;
  };
  handleShare: (platform: 'twitter' | 'linkedin' | 'copy') => void;
  getButtonLabel: (platform: 'twitter' | 'linkedin', action: 'share' | 'reshare') => string;
  getAriaLabel: (platform: 'twitter' | 'linkedin' | 'copy') => string;
  isReshare: (platform: 'twitter' | 'linkedin') => boolean;
}

export function useShareActions({ url, title, description, socialUrls }: ShareConfig): ShareActions {
  const [copied, setCopied] = useState(false);

  const shareData = useMemo(() => ({
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description || title),
  }), [url, title, description]);

  const shareLinks = useMemo(() => ({
    twitter: socialUrls?.twitter || `https://twitter.com/intent/tweet?url=${shareData.url}&text=${shareData.title}`,
    linkedin: socialUrls?.linkedin || `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}`,
  }), [socialUrls, shareData]);

  const handleShare = useCallback((platform: 'twitter' | 'linkedin' | 'copy') => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
    }
  }, [url, shareLinks]);

  const isReshare = useCallback((platform: 'twitter' | 'linkedin') => {
    return platform === 'twitter' ? !!socialUrls?.twitter : !!socialUrls?.linkedin;
  }, [socialUrls]);

  const getButtonLabel = useCallback((platform: 'twitter' | 'linkedin', action: 'share' | 'reshare') => {
    const labels = {
      twitter: { share: 'Twitter', reshare: 'Retweet' },
      linkedin: { share: 'LinkedIn', reshare: 'Reshare' },
    };
    return labels[platform][action];
  }, []);

  const getAriaLabel = useCallback((platform: 'twitter' | 'linkedin' | 'copy') => {
    if (platform === 'copy') {
      return copied ? 'Link copied!' : 'Copy link';
    }
    const isReshareAction = isReshare(platform);
    const labels = {
      twitter: isReshareAction ? 'Retweet on Twitter' : 'Share on Twitter',
      linkedin: isReshareAction ? 'Reshare on LinkedIn' : 'Share on LinkedIn',
    };
    return labels[platform];
  }, [copied, isReshare]);

  return {
    copied,
    shareLinks,
    handleShare,
    getButtonLabel,
    getAriaLabel,
    isReshare,
  };
}
