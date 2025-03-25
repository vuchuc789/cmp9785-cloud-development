'use client';

import { MediaLicense } from '@/client';
import { useSearch } from '@/contexts/search';
import { useWatch } from 'react-hook-form';

export const useFilters = ({
  applyCallback,
}: {
  applyCallback?: () => void;
}) => {
  const { form, search } = useSearch();

  const [license] = useWatch({
    control: form.control,
    name: ['license'],
  });

  const handleLicenseToggle = (lic: MediaLicense) => {
    if (license?.includes(lic)) {
      if (license.length === 1) {
        form.setValue('license', null);
      } else {
        form.setValue(
          'license',
          license.filter((l) => l !== lic)
        );
      }
    } else {
      form.setValue('license', [...(license ?? []), lic]);
    }
  };

  const handleApplyFilters = () => {
    applyCallback?.();
    search();
  };

  const handleResetFilters = () => {
    form.setValue('license', null);
  };

  return {
    handleLicenseToggle,
    handleApplyFilters,
    handleResetFilters,
  };
};
