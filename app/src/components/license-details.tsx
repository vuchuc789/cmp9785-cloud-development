import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MediaLicense, MediaType } from '@/client';

// License information
const licenseInfo = {
  by: {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    description:
      'This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator.',
  },
  'by-nc': {
    name: 'CC BY-NC 4.0',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    description:
      'This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator.',
  },
  'by-nc-nd': {
    name: 'CC BY-NC-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    description:
      'This license allows reusers to copy and distribute the material in any medium or format in unadapted form only, for noncommercial purposes only, and only so long as attribution is given to the creator.',
  },
  'by-nc-sa': {
    name: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    description:
      'This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator. If you remix, adapt, or build upon the material, you must license the modified material under identical terms.',
  },
  'by-nd': {
    name: 'CC BY-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nd/4.0/',
    description:
      'This license allows reusers to copy and distribute the material in any medium or format in unadapted form only, and only so long as attribution is given to the creator.',
  },
  'by-sa': {
    name: 'CC BY-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    description:
      'This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license requires that adaptations be shared under the same terms.',
  },
  cc0: {
    name: 'CC0 1.0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    description:
      'The person who associated a work with this deed has dedicated the work to the public domain by waiving all of their rights to the work worldwide under copyright law, including all related and neighboring rights, to the extent allowed by law.',
  },
  'nc-sampling+': {
    name: 'NC-Sampling+ 1.0',
    url: 'https://creativecommons.org/licenses/nc-sampling+/1.0/',
    description:
      'This license allows noncommercial sampling, remixing, and transformation of the work, provided that attribution is given to the creator.',
  },
  pdm: {
    name: 'Public Domain Mark 1.0',
    url: 'https://creativecommons.org/publicdomain/mark/1.0/',
    description:
      'This work has been identified as being free of known restrictions under copyright law, including all related and neighboring rights.',
  },
  'sampling+': {
    name: 'Sampling+ 1.0',
    url: 'https://creativecommons.org/licenses/sampling+/1.0/',
    description:
      'This license allows for the sampling, remixing, and transformation of the work for commercial or noncommercial purposes, provided that attribution is given to the creator.',
  },
};

// License terms
const licenseTerms = {
  BY: {
    title: 'Credit the creator.',
    description:
      'You must give appropriate credit, provide a link to the license, and indicate if changes were made.',
  },
  NC: {
    title: 'Non-commercial uses only.',
    description: 'You may not use the material for commercial purposes.',
  },
  ND: {
    title: 'No derivatives or adaptations permitted.',
    description:
      'If you remix, transform, or build upon the material, you may not distribute the modified material.',
  },
  SA: {
    title: 'Share adaptations under the same terms.',
    description:
      'If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.',
  },
  CC0: {
    title: 'No rights reserved.',
    description:
      'You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.',
  },
  PDM: {
    title: 'No known copyright restrictions.',
    description:
      'This work has been identified as being free of known restrictions under copyright law, including all related and neighboring rights.',
  },
  'SAMPLING+': {
    title: 'Sampling, remixing, and transformation allowed.',
    description:
      'You are free to sample, remix, and transform this work for commercial or noncommercial purposes.',
  },
};

// Get terms for a specific license
const getLicenseTerms = (license: MediaLicense): string[] => {
  switch (license) {
    case 'by':
      return ['BY'];
    case 'by-nc':
      return ['BY', 'NC'];
    case 'by-nc-nd':
      return ['BY', 'NC', 'ND'];
    case 'by-nc-sa':
      return ['BY', 'NC', 'SA'];
    case 'by-nd':
      return ['BY', 'ND'];
    case 'by-sa':
      return ['BY', 'SA'];
    case 'cc0':
      return ['CC0'];
    case 'nc-sampling+':
      return ['NC', 'SAMPLING+'];
    case 'pdm':
      return ['PDM'];
    case 'sampling+':
      return ['SAMPLING+'];
    default:
      return [];
  }
};

interface LicenseDetailsProps {
  licenseType: MediaLicense;
  mediaType: MediaType;
}

export function LicenseDetails({
  licenseType,
  mediaType,
}: LicenseDetailsProps) {
  const license = licenseInfo[licenseType];
  const terms = getLicenseTerms(licenseType);

  if (!license) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">License</h2>
        <p className="mb-4">
          This {mediaType} was marked with a{' '}
          <a
            href={license.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium items-center gap-1 inline-flex"
          >
            {license.name}
            <ExternalLink className="h-3 w-3" />
          </a>{' '}
          license:
        </p>

        <div className="mb-4 text-muted-foreground">
          <p>{license.description}</p>
        </div>

        <div className="space-y-6">
          {terms.map((term) => (
            <div key={term} className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <span className="font-bold text-primary">{term}</span>
              </div>
              <div>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <h3 className="font-semibold">{licenseTerms[term]?.title}</h3>
                <p className="text-muted-foreground">
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore */}
                  {licenseTerms[term]?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
