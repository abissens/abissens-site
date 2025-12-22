import { postBundle } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { BlogPostPage } from '@/components/pages';
import { metadataInf } from '@/components/metadata';
import type { Metadata } from 'next';
import 'highlight.js/styles/github-dark-dimmed.css';

export async function generateStaticParams() {
  return postBundle.getPublishedPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = postBundle.getPost(slug);

  if (!post) {
    return {};
  }

  const url = `${metadataInf.url}/blog/${post.slug}`;
  const summary = post.summary.substring(0, 160).trim();

  return {
    title: `${post.title} | ${metadataInf.siteName}`,
    description: summary,
    keywords: ['programming', 'coding', 'software development', 'technology', 'blog', post.title.toLowerCase()],
    authors: [{ name: post.author?.name || 'Abissens', url: post.author?.github || metadataInf.url }],
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: summary,
      siteName: metadataInf.siteName,
      locale: 'en_US',
      images: [
        {
          url: '/assets/og-image.png',
          width: 793,
          height: 771,
          alt: post.title,
        }
      ],
      publishedTime: post.date,
      authors: [post.author?.name || 'Abissens'],
      section: 'Technology',
      tags: ['programming', 'coding', 'technology'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: summary,
      images: ['/assets/og-image.png'],
      creator: '@abissens',
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

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = postBundle.getPost(slug);

  if (!post || post.tags.includes('preview')) {
    return notFound();
  }

  return <BlogPostPage post={post} mode="published" />;
}
