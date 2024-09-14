'use client';

import { useMemo } from 'react';
import { PostData } from '@/lib/posts';
import PostList from '@/components/posts/post-list';
import Pagination from '@/components/pagination/Pagination';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import styles from './PaginatedPostList.module.scss';

interface PaginatedPostListProps {
  posts: PostData[];
  postsPerPage?: number;
  enableUrlPagination?: boolean;
}

export default function PaginatedPostList({
  posts,
  postsPerPage = 6,
  enableUrlPagination = true
}: PaginatedPostListProps) {
  const urlPage = useUrlPagination();
  const currentPage = enableUrlPagination ? urlPage : 1;

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  const startIndex = (validCurrentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const currentPosts = useMemo(() => {
    return posts.slice(startIndex, endIndex);
  }, [posts, startIndex, endIndex]);

  return (
    <div className={styles.paginatedPostList}>
      <PostList posts={currentPosts} />

      <Pagination
        currentPage={validCurrentPage}
        totalPages={totalPages}
        useUrlPagination={enableUrlPagination}
      />
    </div>
  );
}
