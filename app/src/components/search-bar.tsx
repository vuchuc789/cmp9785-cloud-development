'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', query);
  };

  const suggestions = [
    'Inception',
    'Breaking Bad',
    'The Dark Knight',
    'Stranger Things',
    'Pink Floyd',
    'The Joe Rogan Experience',
  ];

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative flex w-full max-w-full items-center">
        <Popover open={open && query.length > 0} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for images and audio..."
                className="pl-10 pr-22 h-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
          >
            <Command>
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {suggestions
                    .filter(
                      (item) =>
                        item.toLowerCase().includes(query.toLowerCase()) &&
                        query.length > 0
                    )
                    .map((item) => (
                      <CommandItem
                        key={item}
                        onSelect={() => {
                          setQuery(item);
                          setOpen(false);
                        }}
                      >
                        {item}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          type="submit"
          className="absolute right-1 top-1/2 h-10 -translate-y-1/2 cursor-pointer"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
