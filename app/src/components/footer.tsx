import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          {`© ${new Date().getFullYear()} FileDescriptor?`} All rights
          reserved. Not affiliated with the{' '}
          <a
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
            href="https://en.wikipedia.org/wiki/Linux_kernel"
            target="_blank"
          >
            Linux kernel
          </a>
          .
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="underline underline-offset-4">
            Terms
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy
          </Link>
          <Link href="/contact" className="underline underline-offset-4">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
