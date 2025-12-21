'use client';

import { useState, useCallback, useMemo } from 'react';

export interface ShareConfig {
  url: string;
  title: string;
  description?: string;
  socialUrls?: {
    x?: string;
    linkedin?: string;
  };
}

export interface ShareActions {
  copied: boolean;
  shareLinks: {
    x: string;
    linkedin: string;
  };
  handleShare: (platform: 'x' | 'linkedin' | 'copy') => void;
  getButtonLabel: (platform: 'x' | 'linkedin', action: 'share' | 'reshare') => string;
  getAriaLabel: (platform: 'x' | 'linkedin' | 'copy') => string;
  isReshare: (platform: 'x' | 'linkedin') => boolean;
}

export function useShareActions({ url, title, description, socialUrls }: ShareConfig): ShareActions {
  const [copied, setCopied] = useState(false);

  const shareData = useMemo(() => ({
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description || title),
  }), [url, title, description]);

  const shareLinks = useMemo(() => ({
    x: socialUrls?.x || `https://x.com/intent/tweet?url=${shareData.url}&text=${shareData.title}`,
    linkedin: socialUrls?.linkedin || `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}`,
  }), [socialUrls, shareData]);

  const handleShare = useCallback((platform: 'x' | 'linkedin' | 'copy') => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
    }
  }, [url, shareLinks]);

  const isReshare = useCallback((platform: 'x' | 'linkedin') => {
    return platform === 'x' ? !!socialUrls?.x : !!socialUrls?.linkedin;
  }, [socialUrls]);

  const getButtonLabel = useCallback((platform: 'x' | 'linkedin', action: 'share' | 'reshare') => {
    const labels = {
      x: { share: 'X', reshare: 'Repost' },
      linkedin: { share: 'LinkedIn', reshare: 'Reshare' },
    };
    return labels[platform][action];
  }, []);

  const getAriaLabel = useCallback((platform: 'x' | 'linkedin' | 'copy') => {
    if (platform === 'copy') {
      return copied ? 'Link copied!' : 'Copy link';
    }
    const isReshareAction = isReshare(platform);
    const labels = {
      x: isReshareAction ? 'Repost on X' : 'Share on X',
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
