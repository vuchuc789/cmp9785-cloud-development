'use client';

import { MediaLicense } from '@/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSearch } from '@/contexts/search';
import { useFilters } from '@/hooks/filter';
import { useWatch } from 'react-hook-form';

export function FilterAccordion() {
  const { form } = useSearch();

  const [license] = useWatch({
    control: form.control,
    name: ['license'],
  });

  const { handleLicenseToggle } = useFilters({});

  return (
    <Accordion
      type="multiple"
      defaultValue={['license', 'license_type', 'categories']}
    >
      <AccordionItem value="license">
        <AccordionTrigger className="cursor-pointer">License</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {!!license?.length &&
                license.map((lic) => (
                  <Badge
                    key={lic}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleLicenseToggle(lic)}
                  >
                    {lic} ✕
                  </Badge>
                ))}
            </div>
            {!!license?.length && <Separator className="my-2" />}
            {Object.values(MediaLicense).map((lic) => (
              <div key={lic} className="flex items-center space-x-2">
                <Checkbox
                  id={lic}
                  checked={!!license?.includes(lic)}
                  onCheckedChange={() => handleLicenseToggle(lic)}
                  className="cursor-pointer"
                />
                <Label
                  htmlFor={lic}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {lic}
                </Label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
