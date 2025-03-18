'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export function FilterSidebar() {
  const [yearRange, setYearRange] = useState([1980, 2024]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const genres = [
    'Action',
    'Comedy',
    'Drama',
    'Sci-Fi',
    'Horror',
    'Romance',
    'Thriller',
    'Animation',
    'Documentary',
  ];

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <Accordion
          type="multiple"
          defaultValue={['type', 'genre', 'year', 'rating']}
        >
          <AccordionItem value="type">
            <AccordionTrigger>Media Type</AccordionTrigger>
            <AccordionContent>
              <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All Media</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="movies" id="movies" />
                  <Label htmlFor="movies">Movies</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tv" id="tv" />
                  <Label htmlFor="tv">TV Shows</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="music" id="music" />
                  <Label htmlFor="music">Music</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="podcasts" id="podcasts" />
                  <Label htmlFor="podcasts">Podcasts</Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="genre">
            <AccordionTrigger>Genre</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedGenres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre} ✕
                    </Badge>
                  ))}
                </div>
                {selectedGenres.length > 0 && <Separator className="my-2" />}
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={genre.toLowerCase()}
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => handleGenreToggle(genre)}
                    />
                    <Label
                      htmlFor={genre.toLowerCase()}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {genre}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="year">
            <AccordionTrigger>Year</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Slider
                  defaultValue={[1980, 2024]}
                  max={2024}
                  min={1900}
                  step={1}
                  value={yearRange}
                  onValueChange={setYearRange}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">{yearRange[0]}</span>
                  <span className="text-sm">{yearRange[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="rating">
            <AccordionTrigger>Rating</AccordionTrigger>
            <AccordionContent>
              <RadioGroup defaultValue="any">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="any-rating" />
                  <Label htmlFor="any-rating">Any Rating</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5stars" id="5stars" />
                  <Label htmlFor="5stars">5+ Stars</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4stars" id="4stars" />
                  <Label htmlFor="4stars">4+ Stars</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3stars" id="3stars" />
                  <Label htmlFor="3stars">3+ Stars</Label>
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-4 space-y-2">
          <Button className="w-full">Apply Filters</Button>
          <Button variant="outline" className="w-full">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
