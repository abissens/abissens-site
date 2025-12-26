import dynamic from 'next/dynamic';
import { metadataInf } from '@/components/metadata';
import { Loading } from '@/components/loading';
import type { Metadata } from 'next';

const BasicSearch = dynamic(() => import('@/components/search/BasicSearch'), {
    loading: () => <Loading message="Preparing search..." size="large" />
});

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
  return <BasicSearch />;
}