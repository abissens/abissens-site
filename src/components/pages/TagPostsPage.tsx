import { Suspense } from 'react';
import { PostData } from '@/lib/posts';
import { RouteMode, routeConfigs } from '@/lib/routes';
import PaginatedPostList from '@/components/blog/PaginatedPostList';
import { Loading } from '@/components/loading';
import Link from 'next/link';
import styles from '@/app/tags/[tag]/page.module.scss';

interface TagPostsPageProps {
  tag: string;
  posts: PostData[];
  mode: RouteMode;
}

export default function TagPostsPage({ tag, posts, mode }: TagPostsPageProps) {
  const config = routeConfigs[mode];

  return (
    <div className={styles.tagPage}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href={config.paths.tags} className={styles.breadcrumbLink}>
            All Tags
          </Link>
          <span className={styles.separator}>→</span>
          <span className={styles.currentTag}>#{tag}</span>
        </div>

        <p className={styles.postCount}>
          {posts.length} post{posts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <Suspense fallback={<Loading message="Loading posts..." />}>
        <PaginatedPostList posts={posts} />
      </Suspense>
    </div>
  );
}
