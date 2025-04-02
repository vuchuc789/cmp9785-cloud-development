'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSearch } from '@/contexts/search';
import { Clock, Search, Trash2, X } from 'lucide-react';
import moment from 'moment';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Form, FormControl, FormField } from './ui/form';

export function SearchBar() {
  const [open, setOpen] = useState(false);

  const { state, form, search, deleteHistory } = useSearch();

  const filteredHistory = useMemo(() => {
    return state.history.slice(0, 5);
  }, [state.history]);

  const handleHistoryItemClick = (text: string) => {
    form.setValue('q', text);
    setOpen(false);
    search();
  };

  const removeHistoryItem = async (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    deleteHistory(keyword);
  };

  const clearAllHistory = () => {
    deleteHistory();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(search)} className="relative">
        <div className="relative flex w-full max-w-full items-center">
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="search"
                    placeholder="Search for images and audio..."
                    className="pl-10 pr-32 h-12 focus-visible:ring-0"
                    {...field}
                  />
                </FormControl>
              </div>
            )}
          />

          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  <span className="sr-only">Search history</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[300px] p-0"
                align="end"
                alignOffset={-85}
                sideOffset={8}
              >
                <Command>
                  <CommandList>
                    <CommandEmpty>No search history found</CommandEmpty>
                    {filteredHistory.length > 0 && (
                      <CommandGroup heading="Recent Searches">
                        {filteredHistory.map(({ keyword: q, timestamp: t }) => (
                          <CommandItem
                            key={q}
                            onSelect={() => handleHistoryItemClick(q)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{q}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {moment(t).fromNow()}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-destructive/10 cursor-pointer"
                                onClick={(e) => removeHistoryItem(e, q)}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {filteredHistory.length > 0 && (
                      <>
                        <CommandSeparator />
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={clearAllHistory}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear search history
                          </Button>
                        </div>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button type="submit" className="h-10 cursor-pointer">
              Search
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
