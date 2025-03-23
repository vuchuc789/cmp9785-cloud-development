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
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export function FilterSidebar() {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Filters</h3>
        <Accordion type="multiple" defaultValue={['license', 'categories']}>
          <AccordionItem value="license">
            <AccordionTrigger className="cursor-pointer">
              License
            </AccordionTrigger>
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
                {selectedLicenses.length > 0 && <Separator className="my-2" />}
                {licenses.map((license) => (
                  <div key={license} className="flex items-center space-x-2">
                    <Checkbox
                      id={license.toLowerCase().replace(/\s+/g, '-')}
                      checked={selectedLicenses.includes(license)}
                      onCheckedChange={() => handleLicenseToggle(license)}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={license.toLowerCase().replace(/\s+/g, '-')}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {license}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categories">
            <AccordionTrigger className="cursor-pointer">
              Categories
            </AccordionTrigger>
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
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.toLowerCase()}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={category.toLowerCase()}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-4 space-y-2">
          <Button className="w-full cursor-pointer">Apply Filters</Button>
          <Button variant="outline" className="w-full cursor-pointer">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
