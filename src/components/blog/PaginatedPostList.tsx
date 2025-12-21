'use client';

import { useMemo } from 'react';
import { PostData } from '@/lib/posts';
import PostList from '@/components/posts/post-list';
import Pagination from '@/components/pagination/Pagination';
import { usePagination, paginateItems } from '@/hooks/usePagination';
import styles from './PaginatedPostList.module.scss';

interface PaginatedPostListProps {
  posts: PostData[];
  postsPerPage?: number;
  enableUrlPagination?: boolean;
  showDrafts?: boolean;
  basePath?: string;
}

export default function PaginatedPostList({
  posts,
  postsPerPage = 6,
  enableUrlPagination = true,
  showDrafts = false,
  basePath = '/blog'
}: PaginatedPostListProps) {
  const filteredPosts = useMemo(
    () => showDrafts ? posts : posts.filter(post => !post.tags.includes('preview')),
    [posts, showDrafts]
  );

  const { currentPage, totalPages, startIndex, endIndex } = usePagination({
    totalItems: filteredPosts.length,
    itemsPerPage: postsPerPage,
    enableUrlPagination,
  });

  const currentPosts = useMemo(
    () => paginateItems(filteredPosts, startIndex, endIndex),
    [filteredPosts, startIndex, endIndex]
  );

  return (
    <div className={styles.paginatedPostList}>
      <PostList posts={currentPosts} basePath={basePath} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        useUrlPagination={enableUrlPagination}
      />
    </div>
  );
}
