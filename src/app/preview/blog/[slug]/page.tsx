import { postBundle } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { BlogPostPage } from '@/components/pages';
import 'highlight.js/styles/github-dark-dimmed.css';

// Return 404 for slugs not in generateStaticParams (required for static export)
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = postBundle.getPosts();
  if (posts.length === 0) {
    return [{ slug: '__placeholder__' }];
  }
  return posts.map(post => ({ slug: post.slug }));
}

export default async function PreviewBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = postBundle.getPost(slug);

  if (!post) {
    return notFound();
  }

  return <BlogPostPage post={post} mode="preview" />;
}
