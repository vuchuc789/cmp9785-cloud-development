'use client';

import { Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearch } from '@/contexts/search';
import { usePagination } from '@/hooks/pagination';
import { stringToColor } from '@/lib/utils';
import { ImageIcon, Music, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function MediaResults() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [playingAudio, setPlayingAudio] = useState<{
    id: string;
    url: string;
  } | null>(null);

  const {
    state: { imageResult, audioResult },
    form,
    search,
  } = useSearch();

  const mediaType = searchParams.get('type') === 'audio' ? 'audio' : 'image';

  const pagination = usePagination({
    pageNumber:
      mediaType === 'image'
        ? (imageResult?.page ?? 1)
        : (audioResult?.page ?? 1),
    pageCount:
      mediaType === 'image'
        ? (imageResult?.page_count ?? 1)
        : (audioResult?.page_count ?? 1),
  });

  const getPageQueryString = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));

      return params.toString();
    },
    [searchParams]
  );

  const onChangeTab = (value: string) => {
    form.setValue('type', value as 'image' | 'audio');

    search();
  };

  const playAudio = useCallback((id?: string, url?: string) => {
    setPlayingAudio((old) => {
      if (id && url && id !== old?.id) {
        return { id, url };
      } else {
        return null;
      }
    });
  }, []);

  useEffect(() => {
    if (!playingAudio?.url) {
      return;
    }

    const audio = new Audio(playingAudio.url);
    const listener = () => {
      playAudio();
    };

    audio.addEventListener('ended', listener);
    audio.play();

    return () => {
      audio.pause();
      audio.removeEventListener('ended', listener);
    };
  }, [playingAudio?.url, playAudio]);

  // pause audio when search params are changed
  useEffect(() => {
    playAudio();
  }, [searchParams, playAudio]);

  return (
    <Tabs
      defaultValue={mediaType}
      className="w-full"
      onValueChange={onChangeTab}
    >
      <TabsList className="mb-6 border-b rounded-none w-full h-auto p-0 bg-transparent justify-start">
        <TabsTrigger
          value="image"
          className="flex items-center gap-2 px-6 py-3 rounded-none border-0 border-b-2 border-transparent cursor-pointer data-[state=active]:border-gray-900 dark:data-[state=active]:border-gray-100 bg-transparent data-[state=active]:shadow-xs"
        >
          <ImageIcon className="h-5 w-5" />
          <span>Images</span>
        </TabsTrigger>
        <TabsTrigger
          value="audio"
          className="flex items-center gap-2 px-6 py-3 rounded-none border-0 border-b-2 border-transparent cursor-pointer data-[state=active]:border-gray-900 dark:data-[state=active]:border-gray-100 bg-transparent data-[state=active]:shadow-xs"
        >
          <Music className="h-5 w-5" />
          <span>Audio</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="image" className="mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {!!imageResult?.results.length &&
            imageResult.results.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-0 rounded-md py-0 cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={item.thumbnail}
                    alt={item.title ?? 'An image'}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="/placeholder.svg"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-xs font-medium">{item.license}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {!!imageResult && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      !imageResult?.page || imageResult.page === 1
                        ? '#'
                        : pathname +
                          '?' +
                          getPageQueryString(imageResult.page - 1)
                    }
                    scroll={false}
                  />
                </PaginationItem>
                {pagination.map((ele) => {
                  if (ele === 'left-ellipsis' || ele === 'right-ellipsis') {
                    return (
                      <PaginationItem key={ele}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={ele}>
                      <PaginationLink
                        href={pathname + '?' + getPageQueryString(ele)}
                        isActive={imageResult?.page === ele}
                        scroll={false}
                      >
                        {ele}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href={
                      !imageResult?.page ||
                      imageResult.page === imageResult.page_count
                        ? '#'
                        : pathname +
                          '?' +
                          getPageQueryString(imageResult.page + 1)
                    }
                    scroll={false}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </TabsContent>

      <TabsContent value="audio" className="mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {!!audioResult?.results.length &&
            audioResult.results.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-0 rounded-md py-0 cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <div
                  className={`relative aspect-square w-full group`}
                  style={{
                    backgroundColor: stringToColor(
                      item.title ?? 'An audio file'
                    ),
                  }}
                >
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-xs font-medium">{item.license}</p>
                    </div>
                  </div>
                  <button
                    className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-gray-900/80 flex items-center justify-center text-white hover:bg-gray-900 z-10 cursor-pointer"
                    aria-label={`Play ${item.title}`}
                    onClick={() => {
                      playAudio(item.id, item.url ?? undefined);
                    }}
                  >
                    {item.id === playingAudio?.id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </Card>
            ))}
        </div>

        {!!audioResult && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      !audioResult?.page || audioResult.page === 1
                        ? '#'
                        : pathname +
                          '?' +
                          getPageQueryString(audioResult.page - 1)
                    }
                    scroll={false}
                  />
                </PaginationItem>
                {pagination.map((ele) => {
                  if (ele === 'left-ellipsis' || ele === 'right-ellipsis') {
                    return (
                      <PaginationItem key={ele}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={ele}>
                      <PaginationLink
                        href={pathname + '?' + getPageQueryString(ele)}
                        isActive={audioResult?.page === ele}
                        scroll={false}
                      >
                        {ele}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href={
                      !audioResult?.page ||
                      audioResult.page === audioResult.page_count
                        ? '#'
                        : pathname +
                          '?' +
                          getPageQueryString(audioResult.page + 1)
                    }
                    scroll={false}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
