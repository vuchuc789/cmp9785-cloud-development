import React, { Suspense } from 'react';

import { FileProvider } from '@/contexts/file';

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
