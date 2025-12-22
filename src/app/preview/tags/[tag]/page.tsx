import { postBundle } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { TagPostsPage } from '@/components/pages';

export async function generateStaticParams() {
  return postBundle.getAllTags()
    .map(tag => ({
      tag: encodeURIComponent(tag),
    }));
}

export default async function PreviewTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = postBundle.getPostsByTag(decodedTag);

  if (posts.length === 0) {
    return notFound();
  }

  return <TagPostsPage tag={decodedTag} posts={posts} mode="preview" />;
}
