import { Suspense } from 'react';
import { postBundle } from '@/lib/posts';
import { RouteMode } from '@/lib/routes';
import PaginatedPostList from '@/components/blog/PaginatedPostList';
import { BlogStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';
import styles from '@/app/blog/page.module.scss';

interface BlogListPageProps {
  mode: RouteMode;
}

export default function BlogListPage({ mode }: BlogListPageProps) {
  const posts = mode === 'preview'
    ? postBundle.getPosts()
    : postBundle.getPublishedPosts();

  return (
    <div className={styles.postListPage}>
      {mode === 'published' && <BlogStructuredData url={metadataInf.url} />}
      <Suspense fallback={<div>Loading posts...</div>}>
        <PaginatedPostList posts={posts} />
      </Suspense>
    </div>
  );
}
