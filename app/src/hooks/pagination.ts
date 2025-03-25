'use client';

import { useMemo } from 'react';

export const usePagination = ({
  pageNumber,
  pageCount,
  siblingCount = 1,
}: {
  pageNumber: number;
  pageCount: number;
  siblingCount?: number; // Number of pages to show on each side of the current page
}): ('left-ellipsis' | number | 'right-ellipsis')[] => {
  const pagination = useMemo(() => {
    const totalNumbers = siblingCount * 2 + 3; // Current page + siblings + first & last

    if (pageCount <= totalNumbers) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(2, pageNumber - siblingCount);
    const rightSibling = Math.min(pageCount - 1, pageNumber + siblingCount);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < pageCount - 1;

    if (!showLeftDots && showRightDots) {
      return [
        ...Array.from({ length: 3 + siblingCount * 2 }, (_, i) => i + 1),
        'right-ellipsis' as const,
        pageCount,
      ];
    }

    if (showLeftDots && !showRightDots) {
      return [
        1,
        'left-ellipsis' as const,
        ...Array.from(
          { length: 3 + siblingCount * 2 },
          (_, i) => pageCount - siblingCount * 2 - 2 + i
        ),
      ];
    }

    return [
      1,
      'left-ellipsis' as const,
      ...Array.from(
        { length: 1 + siblingCount * 2 },
        (_, i) => leftSibling + i
      ),
      'right-ellipsis' as const,
      pageCount,
    ];
  }, [pageNumber, pageCount, siblingCount]);

  return pagination;
};
