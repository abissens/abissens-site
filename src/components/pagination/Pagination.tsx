'use client';

import { memo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './Pagination.module.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
  useUrlPagination?: boolean;
}

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  useUrlPagination = false
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (useUrlPagination) {
      const params = new URLSearchParams(searchParams);
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(url, { scroll: false });

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className={`${styles.pagination} ${className || ''}`}>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.paginationButton}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <div className={styles.paginationNumbers}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          if (
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 1
          ) {
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${styles.paginationButton} ${page === currentPage ? styles.active : ''}`}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          } else if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return (
              <span key={page} className={styles.paginationEllipsis}>
                …
              </span>
            );
          }
          return null;
        })}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.paginationButton}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
});

export default Pagination;
