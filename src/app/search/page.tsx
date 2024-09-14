import { Suspense } from 'react';
import BasicSearch from '@/components/search/BasicSearch';
import { metadataInf } from '@/components/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Search | ${metadataInf.siteName}`,
  description: 'Search through all blog posts by title, content, or tags.',
  openGraph: {
    type: 'website',
    url: `${metadataInf.url}/search`,
    title: `Search | ${metadataInf.siteName}`,
    description: 'Search through all blog posts by title, content, or tags.',
    siteName: metadataInf.siteName,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: `Search | ${metadataInf.siteName}`,
    description: 'Search through all blog posts by title, content, or tags.',
  },
  alternates: {
    canonical: `${metadataInf.url}/search`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Search() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <BasicSearch />
    </Suspense>
  );
}