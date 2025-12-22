import { postBundle } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { TagPostsPage } from '@/components/pages';
import { metadataInf } from '@/components/metadata';
import type { Metadata } from 'next';

// Return 404 for tags not in generateStaticParams (required for static export)
export const dynamicParams = false;

export async function generateStaticParams() {
  return postBundle.getPublishedTags()
    .map(tag => ({
      tag: encodeURIComponent(tag),
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = postBundle.getPublishedPostsByTag(decodedTag);

  if (posts.length === 0) {
    return {};
  }

  const url = `${metadataInf.url}/tags/${tag}`;
  const title = `Posts tagged "${decodedTag}"`;
  const description = `Browse ${posts.length} post${posts.length !== 1 ? 's' : ''} tagged with "${decodedTag}".`;

  return {
    title: `${title} | ${metadataInf.siteName}`,
    description,
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: metadataInf.siteName,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = postBundle.getPublishedPostsByTag(decodedTag);

  if (posts.length === 0) {
    return notFound();
  }

  return <TagPostsPage tag={decodedTag} posts={posts} mode="published" />;
}
