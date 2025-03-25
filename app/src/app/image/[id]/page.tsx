'use client';

import {
  ImageSearchItem,
  mediaDetailMediaDetailGet,
  MediaLicense,
} from '@/client';
import { LicenseDetails } from '@/components/license-details';
import { Button } from '@/components/ui/button';
import { isBrowser } from '@/lib/utils';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ImageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [imageDetails, setImageDetails] = useState<ImageSearchItem>();

  const router = useRouter();

  useEffect(() => {
    const asyncFunc = async () => {
      const result = await mediaDetailMediaDetailGet({
        query: {
          type: 'image',
          id,
        },
      });

      if (!result.data) {
        toast.error('Failed to fetch media details');
        return;
      }

      setImageDetails(result.data as ImageSearchItem);
    };
    asyncFunc();
  }, [id]);

  return (
    <div className="grow max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2 h-8 cursor-pointer"
          onClick={() => {
            if (isBrowser() && window.history.length > 1) {
              router.back();
            } else {
              router.replace('/search');
            }
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to results
        </Button>
      </div>

      {!!imageDetails && (
        <>
          {/* Full width image */}
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-8">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={imageDetails?.url || '/placeholder.svg'}
                alt={imageDetails?.attribution ?? 'An image'}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title, creator and source with View Original button on the right */}
          <div className="mb-8 flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold truncate">
                {imageDetails?.title ?? ''}
              </h1>
              <p className="text-muted-foreground mt-1">
                by{' '}
                <Link
                  href={imageDetails?.creator_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {imageDetails?.creator ?? ''}
                </Link>{' '}
                via{' '}
                <Link
                  href={imageDetails?.foreign_landing_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {imageDetails?.source ?? ''}
                </Link>
              </p>
            </div>

            <Link
              href={imageDetails?.foreign_landing_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="flex items-center gap-2 cursor-pointer flex-1">
                <ExternalLink className="h-4 w-4" />
                View Original
              </Button>
            </Link>
          </div>

          {/* License details */}
          <LicenseDetails
            licenseType={(imageDetails?.license ?? '') as MediaLicense}
            mediaType="image"
          />
        </>
      )}
    </div>
  );
}
