'use client';

import { Button } from '@/components/ui/button';
import { useFilters } from '@/hooks/filter';
import { FilterAccordion } from './filter-accordion';

export function FilterSidebar() {
  const { handleApplyFilters, handleResetFilters } = useFilters({});

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <FilterAccordion />
        <div className="mt-4 space-y-2">
          <Button
            className="w-full cursor-pointer"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={handleResetFilters}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
