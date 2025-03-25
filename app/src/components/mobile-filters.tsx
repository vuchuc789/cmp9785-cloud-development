'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useFilters } from '@/hooks/filter';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { FilterAccordion } from './filter-accordion';

export function MobileFilters() {
  const [open, setOpen] = useState(false);

  const { handleApplyFilters, handleResetFilters } = useFilters({
    applyCallback: () => {
      setOpen(false);
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="mb-4 w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[400px] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="px-4 py-4">
              <FilterAccordion />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t p-4 bg-background">
          <div className="space-y-2">
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
