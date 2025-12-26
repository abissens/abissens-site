import { Suspense } from 'react';
import { postBundle } from '@/lib/posts';
import { RouteMode } from '@/lib/routes';
import PaginatedPostList from '@/components/blog/PaginatedPostList';
import { BlogStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';
import { Loading } from '@/components/loading';
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
      <Suspense fallback={<Loading message="Loading posts..." />}>
        <PaginatedPostList posts={posts} />
      </Suspense>
    </div>
  );
}
