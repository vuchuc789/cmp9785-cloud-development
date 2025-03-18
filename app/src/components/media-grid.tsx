'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Bookmark, Info, Play, Share2, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Mock data for demonstration
const mockMediaItems = [
  {
    id: 1,
    title: 'Inception',
    type: 'Movie',
    year: 2010,
    rating: 4.8,
    genres: ['Sci-Fi', 'Action'],
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    image: '/placeholder.svg?height=400&width=300',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
  },
  {
    id: 2,
    title: 'Breaking Bad',
    type: 'TV Show',
    year: 2008,
    rating: 4.9,
    genres: ['Drama', 'Crime'],
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    image: '/placeholder.svg?height=400&width=300',
    creator: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
  },
  {
    id: 3,
    title: 'The Dark Side of the Moon',
    type: 'Music',
    year: 1973,
    rating: 5.0,
    genres: ['Rock', 'Progressive'],
    description:
      'The eighth studio album by English rock band Pink Floyd, released on 1 March 1973.',
    image: '/placeholder.svg?height=400&width=300',
    artist: 'Pink Floyd',
    tracks: [
      'Speak to Me',
      'Breathe',
      'On the Run',
      'Time',
      'The Great Gig in the Sky',
    ],
  },
  {
    id: 4,
    title: 'The Joe Rogan Experience',
    type: 'Podcast',
    year: 2009,
    rating: 4.5,
    genres: ['Talk', 'Comedy'],
    description:
      'The Joe Rogan Experience is a free audio and video podcast hosted by American comedian and UFC color commentator Joe Rogan.',
    image: '/placeholder.svg?height=400&width=300',
    host: 'Joe Rogan',
    episodes: 2000,
  },
  {
    id: 5,
    title: 'Interstellar',
    type: 'Movie',
    year: 2014,
    rating: 4.7,
    genres: ['Sci-Fi', 'Adventure'],
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    image: '/placeholder.svg?height=400&width=300',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
  },
  {
    id: 6,
    title: 'Stranger Things',
    type: 'TV Show',
    year: 2016,
    rating: 4.6,
    genres: ['Drama', 'Fantasy'],
    description:
      'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    image: '/placeholder.svg?height=400&width=300',
    creator: 'The Duffer Brothers',
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
  },
  {
    id: 7,
    title: 'Abbey Road',
    type: 'Music',
    year: 1969,
    rating: 4.9,
    genres: ['Rock', 'Pop'],
    description:
      'The eleventh studio album by English rock band the Beatles, released on 26 September 1969.',
    image: '/placeholder.svg?height=400&width=300',
    artist: 'The Beatles',
    tracks: [
      'Come Together',
      'Something',
      "Maxwell's Silver Hammer",
      'Oh! Darling',
      "Octopus's Garden",
    ],
  },
  {
    id: 8,
    title: 'Serial',
    type: 'Podcast',
    year: 2014,
    rating: 4.8,
    genres: ['True Crime', 'Investigative'],
    description:
      'Serial is a podcast series that tells one story over the course of a season.',
    image: '/placeholder.svg?height=400&width=300',
    host: 'Sarah Koenig',
    episodes: 41,
  },
];

export function MediaGrid() {
  const [selectedMedia, setSelectedMedia] = useState<
    (typeof mockMediaItems)[0] | null
  >(null);
  const [sortBy, setSortBy] = useState('relevance');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Results</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockMediaItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">{item.type}</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start p-4">
                  <div className="flex w-full items-center justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-muted-foreground">
                    <span>{item.year}</span>
                    <span className="mx-1">•</span>
                    <span>{item.genres.join(', ')}</span>
                  </div>
                  <div className="mt-2 flex w-full justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0"
                          onClick={() => setSelectedMedia(item)}
                        >
                          <Info className="mr-1 h-4 w-4" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        {selectedMedia && (
                          <>
                            <DialogHeader>
                              <DialogTitle>{selectedMedia.title}</DialogTitle>
                              <DialogDescription>
                                {selectedMedia.year} • {selectedMedia.type} •{' '}
                                {selectedMedia.genres.join(', ')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="relative aspect-[3/4] w-full">
                                <Image
                                  src={
                                    selectedMedia.image || '/placeholder.svg'
                                  }
                                  alt={selectedMedia.title}
                                  fill
                                  className="rounded-md object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center mb-4">
                                  <Star className="mr-1 h-5 w-5 fill-primary text-primary" />
                                  <span className="text-lg font-medium">
                                    {selectedMedia.rating}/5.0
                                  </span>
                                </div>
                                <ScrollArea className="h-[200px] rounded-md">
                                  <p className="text-sm">
                                    {selectedMedia.description}
                                  </p>

                                  {selectedMedia.director && (
                                    <div className="mt-4">
                                      <h4 className="font-semibold">
                                        Director
                                      </h4>
                                      <p className="text-sm">
                                        {selectedMedia.director}
                                      </p>
                                    </div>
                                  )}

                                  {selectedMedia.creator && (
                                    <div className="mt-4">
                                      <h4 className="font-semibold">Creator</h4>
                                      <p className="text-sm">
                                        {selectedMedia.creator}
                                      </p>
                                    </div>
                                  )}

                                  {selectedMedia.artist && (
                                    <div className="mt-4">
                                      <h4 className="font-semibold">Artist</h4>
                                      <p className="text-sm">
                                        {selectedMedia.artist}
                                      </p>
                                    </div>
                                  )}

                                  {selectedMedia.host && (
                                    <div className="mt-4">
                                      <h4 className="font-semibold">Host</h4>
                                      <p className="text-sm">
                                        {selectedMedia.host}
                                      </p>
                                    </div>
                                  )}

                                  {selectedMedia.cast && (
                                    <div className="mt-4">
                                      <h4 className="font-semibold">Cast</h4>
                                      <p className="text-sm">
                                        {selectedMedia.cast.join(', ')}
                                      </p>
                                    </div>
                                  )}

                                  {selectedMedia.tracks && (
                                    <div className="mt-4">
                                      <h4 className="font-semibold">Tracks</h4>
                                      <ul className="list-disc pl-5 text-sm">
                                        {selectedMedia.tracks.map(
                                          (track, index) => (
                                            <li key={index}>{track}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </ScrollArea>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button className="gap-2">
                                <Play className="h-4 w-4" />
                                Watch Now
                              </Button>
                              <Button variant="outline" className="gap-2">
                                <Bookmark className="h-4 w-4" />
                                Add to List
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Share</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save to list</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="space-y-4">
            {mockMediaItems.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-[200px] w-full sm:w-[150px]">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <CardHeader className="p-0 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>{item.title}</CardTitle>
                        <Badge variant="secondary">{item.type}</Badge>
                      </div>
                      <CardDescription>
                        {item.year} • {item.genres.join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <div className="flex items-center mb-2">
                      <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">
                        {item.rating}/5.0
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {item.description}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedMedia(item)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Bookmark className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
