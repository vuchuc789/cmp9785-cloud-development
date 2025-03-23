'use client';

import { Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, Music, Play } from 'lucide-react';
import Image from 'next/image';

// Mock data for demonstration
const mockAudioItems = [
  {
    id: 1,
    title: 'Happy',
    artist: 'Pharrell Williams',
    license: 'Standard License',
    color: 'bg-yellow-400',
  },
  {
    id: 2,
    title: 'Happy acoustic',
    artist: 'Acoustic Covers',
    license: 'Creative Commons',
    color: 'bg-blue-400',
  },
  {
    id: 3,
    title: 'Happy',
    artist: 'The Rolling Stones',
    license: 'Premium License',
    color: 'bg-red-400',
  },
  {
    id: 4,
    title: 'Happy!',
    artist: 'B-eiger',
    license: 'Royalty Free',
    color: 'bg-green-400',
  },
  {
    id: 5,
    title: 'Your Happy Face',
    artist: 'Indie Artist',
    license: 'Creative Commons',
    color: 'bg-purple-400',
  },
  {
    id: 6,
    title: 'Happy Music way',
    artist: 'Various Artists',
    license: 'Standard License',
    color: 'bg-orange-400',
  },
  {
    id: 7,
    title: 'Happy End',
    artist: 'Movie Soundtracks',
    license: 'Editorial Use',
    color: 'bg-teal-400',
  },
  {
    id: 8,
    title: 'Happy Days',
    artist: 'TV Themes',
    license: 'Commercial Use',
    color: 'bg-indigo-400',
  },
];

const mockImageItems = [
  {
    id: 1,
    title: 'Happy Child',
    creator: 'Photographer 1',
    license: 'Creative Commons',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Child',
  },
  {
    id: 2,
    title: 'Happy Couple',
    creator: 'Photographer 2',
    license: 'Standard License',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Couple',
  },
  {
    id: 3,
    title: 'Happy Dog',
    creator: 'Photographer 3',
    license: 'Premium License',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Dog',
  },
  {
    id: 4,
    title: 'Happy Family',
    creator: 'Photographer 4',
    license: 'Editorial Use',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Family',
  },
  {
    id: 5,
    title: 'Happy Birthday',
    creator: 'Photographer 5',
    license: 'Commercial Use',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Birthday',
  },
  {
    id: 6,
    title: 'Happy Hour',
    creator: 'Photographer 6',
    license: 'Royalty Free',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Hour',
  },
  {
    id: 7,
    title: 'Happy Place',
    creator: 'Photographer 7',
    license: 'Creative Commons',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Place',
  },
  {
    id: 8,
    title: 'Happy Holidays',
    creator: 'Photographer 8',
    license: 'Standard License',
    image:
      'https://kzmkbhwnll8jtfmbifsk.lite.vusercontent.net/placeholder.svg?height=400&width=400&text=Happy+Holidays',
  },
];

export function MediaResults() {
  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="mb-6 border-b rounded-none w-full h-auto p-0 bg-transparent justify-start">
        <TabsTrigger
          value="images"
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

      <TabsContent value="images" className="mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockImageItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-0 rounded-md py-0 cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800">
                <Image
                  src={item.image || '/placeholder.svg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="/placeholder.svg"
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

        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">4</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">5</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>

      <TabsContent value="audio" className="mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockAudioItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-0 rounded-md py-0 cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div
                className={`relative aspect-square w-full ${item.color} group`}
              >
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
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
                >
                  <Play className="h-5 w-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">4</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">5</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </TabsContent>
    </Tabs>
  );
}
