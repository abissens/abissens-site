'use client';

import { useState, useEffect, useCallback, useMemo, useTransition, memo } from 'react';
import { PostData } from '@/lib/posts';
import PostList from '@/components/posts/post-list';
import Pagination from '@/components/pagination/Pagination';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import { useSearchParams } from 'next/navigation';
import styles from './BasicSearch.module.scss';

interface BasicSearchClientProps {
  posts: PostData[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const MemoizedPostList = memo(function SearchPostList({ posts }: { posts: PostData[] }) {
  return <PostList posts={posts} />;
}, (prevProps, nextProps) => {
  if (prevProps.posts.length !== nextProps.posts.length) return false;

  for (let i = 0; i < prevProps.posts.length; i++) {
    if (prevProps.posts[i].slug !== nextProps.posts[i].slug) return false;
  }

  return true;
});

const POSTS_PER_PAGE = 6;

export default function BasicSearchClient({ posts }: BasicSearchClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>(posts);

  const searchParams = useSearchParams();
  const currentPage = useUrlPagination();

  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const filteredPostsMemo = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return posts;
    }

    const terms = debouncedSearchTerm.toLowerCase().split(' ').filter(term => term.length > 0);

    return posts.filter(post => {
      const searchableText = [
        post.title.toLowerCase(),
        post.summary.toLowerCase(),
        post.content.toLowerCase(),
        ...post.tags.map(tag => tag.toLowerCase())
      ].join(' ');

      return terms.every(term => searchableText.includes(term));
    });
  }, [debouncedSearchTerm, posts]);

  useEffect(() => {
    startTransition(() => {
      setFilteredPosts(filteredPostsMemo);
    });
  }, [filteredPostsMemo]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const startIndex = (validCurrentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const searchResultsText = useMemo(() => {
    if (isPending && searchTerm.trim()) {
      return 'Searching...';
    }

    if (searchTerm.trim()) {
      const showing = Math.min(endIndex, filteredPosts.length);
      const total = filteredPosts.length;
      return (
        <>
          Found <strong>{total}</strong> result{total !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;
          {total > POSTS_PER_PAGE && (
            <span className={styles.paginationInfo}>
              {' '}(showing {startIndex + 1}-{showing} of {total})
            </span>
          )}
        </>
      );
    }

    const showing = Math.min(endIndex, posts.length);
    const total = posts.length;
    return (
      <>
        All posts ({total})
        {total > POSTS_PER_PAGE && (
          <span className={styles.paginationInfo}>
            {' '}(showing {startIndex + 1}-{showing} of {total})
          </span>
        )}
      </>
    );
  }, [isPending, searchTerm, filteredPosts.length, posts.length, startIndex, endIndex]);

  return (
    <div className={styles.searchPage}>
      <header className={styles.searchHeader}>
        <h1 className={styles.pageTitle}>Search</h1>
        <p className={styles.pageDescription}>
          Find articles, tutorials, and insights from the blog
        </p>
      </header>

      <div className={styles.searchForm}>
        <div className={styles.searchInputContainer}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search articles..."
            className={styles.searchInput}
            autoFocus
          />
          <button type="button" className={styles.searchButton}>
            Search
          </button>
        </div>
      </div>

      <div className={styles.searchResults}>
        <p className={`${isPending ? styles.resultCount + ' ' + styles.searching : (searchTerm.trim() ? styles.resultCount : styles.allPostsText)}`}>
          {searchResultsText}
        </p>

        <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s ease-in-out' }}>
          <MemoizedPostList posts={currentPosts} />
        </div>

        <Pagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          useUrlPagination={true}
        />
      </div>
    </div>
  );
}
