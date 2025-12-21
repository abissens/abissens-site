import { Suspense } from 'react';
import { postBundle } from '@/lib/posts';
import { notFound } from 'next/navigation';
import PaginatedPostList from '@/components/blog/PaginatedPostList';
import Link from 'next/link';
import styles from './page.module.scss';
import { metadataInf } from '@/components/metadata';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return postBundle.getAllTags()
    .filter(tag => tag !== 'preview')
    .map(tag => ({
      tag: encodeURIComponent(tag),
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = postBundle.getPostsByTag(decodedTag);

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
  const posts = postBundle.getPostsByTag(decodedTag);

  if (posts.length === 0) {
    return notFound();
  }

  return (
    <div className={styles.tagPage}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/tags" className={styles.breadcrumbLink}>
            All Tags
          </Link>
          <span className={styles.separator}>→</span>
          <span className={styles.currentTag}>#{decodedTag}</span>
        </div>

        <p className={styles.postCount}>
          {posts.length} post{posts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <Suspense fallback={<div>Loading posts...</div>}>
        <PaginatedPostList posts={posts} />
      </Suspense>
    </div>
  );
}
