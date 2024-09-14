'use client';

import { useSearchParams } from 'next/navigation';

export function useUrlPagination() {
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const validatedPage = Math.max(1, isNaN(currentPage) ? 1 : currentPage);

  return validatedPage;
}
