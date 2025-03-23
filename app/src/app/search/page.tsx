'use client';

import { FilterSidebar } from '@/components/filter-sidebar';
import { MediaResults } from '@/components/media-results';
import { MobileFilters } from '@/components/mobile-filters';
import { SearchBar } from '@/components/search-bar';
import { useAuthRequired } from '@/hooks/auth';

export default function Page() {
  useAuthRequired();

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 md:py-10">
        <div className="mb-8">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Discover Media
          </h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Search for images and audio all in one place.
          </p>
        </div>
        <SearchBar />
        <div className="flex flex-col gap-8 md:flex-row mt-8">
          <div className="hidden md:block w-[240px] flex-shrink-0">
            <FilterSidebar />
          </div>
          <div className="md:hidden">
            <MobileFilters />
          </div>
          <div className="flex-1">
            <MediaResults />
          </div>
        </div>
      </div>
    </>
  );
}
