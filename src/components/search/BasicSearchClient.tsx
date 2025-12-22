'use client';

import { useState, useEffect, useCallback, useMemo, useTransition, memo } from 'react';
import { SearchPost } from '@/lib/posts';
import PostList from '@/components/posts/post-list';
import Pagination from '@/components/pagination/Pagination';
import { usePagination, paginateItems } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchParams } from 'next/navigation';
import styles from './BasicSearch.module.scss';

interface BasicSearchClientProps {
  posts: SearchPost[];
}

const MemoizedPostList = memo(function SearchPostList({ posts }: { posts: SearchPost[] }) {
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
  const [filteredPosts, setFilteredPosts] = useState<SearchPost[]>(posts);

  const searchParams = useSearchParams();
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  const { currentPage, totalPages, startIndex, endIndex } = usePagination({
    totalItems: filteredPosts.length,
    itemsPerPage: POSTS_PER_PAGE,
  });

  const currentPosts = useMemo(
    () => paginateItems(filteredPosts, startIndex, endIndex),
    [filteredPosts, startIndex, endIndex]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
        post.searchContent.toLowerCase(),
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
          currentPage={currentPage}
          totalPages={totalPages}
          useUrlPagination={true}
        />
      </div>
    </div>
  );
}
