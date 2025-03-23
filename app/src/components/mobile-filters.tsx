'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function MobileFilters() {
  const [open, setOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);

  const categories = [
    'Nature',
    'Abstract',
    'Portrait',
    'Landscape',
    'Rock',
    'Jazz',
    'Classical',
    'Electronic',
    'Hip-Hop',
    'Ambient',
  ];

  const licenses = [
    'Creative Commons',
    'Standard License',
    'Premium License',
    'Editorial Use',
    'Commercial Use',
    'Royalty Free',
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleLicenseToggle = (license: string) => {
    setSelectedLicenses((prev) =>
      prev.includes(license)
        ? prev.filter((l) => l !== license)
        : [...prev, license]
    );
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
    setOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedLicenses([]);
  };

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
              <Accordion
                type="multiple"
                defaultValue={['license', 'categories']}
              >
                <AccordionItem value="license">
                  <AccordionTrigger>License</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedLicenses.map((license) => (
                          <Badge
                            key={license}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleLicenseToggle(license)}
                          >
                            {license} ✕
                          </Badge>
                        ))}
                      </div>
                      {selectedLicenses.length > 0 && (
                        <Separator className="my-2" />
                      )}
                      {licenses.map((license) => (
                        <div
                          key={license}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`mobile-${license.toLowerCase().replace(/\s+/g, '-')}`}
                            checked={selectedLicenses.includes(license)}
                            onCheckedChange={() => handleLicenseToggle(license)}
                          />
                          <Label
                            htmlFor={`mobile-${license.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {license}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="categories">
                  <AccordionTrigger>Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCategories.map((category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleCategoryToggle(category)}
                          >
                            {category} ✕
                          </Badge>
                        ))}
                      </div>
                      {selectedCategories.length > 0 && (
                        <Separator className="my-2" />
                      )}
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`mobile-${category.toLowerCase()}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() =>
                              handleCategoryToggle(category)
                            }
                          />
                          <Label
                            htmlFor={`mobile-${category.toLowerCase()}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
