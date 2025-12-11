'use client';

import { useMemo } from 'react';
import { useUrlPagination } from './useUrlPagination';

interface PaginationConfig {
  totalItems: number;
  itemsPerPage: number;
  enableUrlPagination?: boolean;
}

interface PaginationResult {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePagination({
  totalItems,
  itemsPerPage,
  enableUrlPagination = true,
}: PaginationConfig): PaginationResult {
  const urlPage = useUrlPagination();
  const currentPageFromUrl = enableUrlPagination ? urlPage : 1;

  return useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = Math.min(Math.max(1, currentPageFromUrl), Math.max(1, totalPages));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [totalItems, itemsPerPage, currentPageFromUrl]);
}

export function paginateItems<T>(items: T[], startIndex: number, endIndex: number): T[] {
  return items.slice(startIndex, endIndex);
}
