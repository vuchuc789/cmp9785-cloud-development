import Footer from '@/components/footer';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth';
import { ThemeProvider } from '@/contexts/theme';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';

import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NotificationProvider } from '@/contexts/notification';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Media Search',
    default: 'Media Search',
  },
  description: 'Website for searching open-licence media',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthProvider>
              <NotificationProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  {children}
                  <Footer />
                </div>
                <Toaster />
              </NotificationProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
