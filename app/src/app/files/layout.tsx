import React, { Suspense } from 'react';

import { FileProvider } from '@/contexts/file';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Files',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <FileProvider>{children}</FileProvider>
    </Suspense>
  );
}
