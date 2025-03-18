import { Button } from '@/components/ui/button';
import Avatar from 'boring-avatars';
import { LogIn, Search } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const randStr = crypto.randomUUID();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center grow p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-start">
        <div className="flex gap-4 flex-wrap">
          {(
            ['bauhaus', 'beam', 'marble', 'pixel', 'ring', 'sunset'] as const
          ).map((variant, i) => (
            <Avatar key={i} name={randStr} variant={variant} size={72} />
          ))}
        </div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Explore millions of creative works
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          An extensive library of free stock photos, images, and audio,
          available for free use.
        </p>

        <div className="flex gap-4 items-start flex-col sm:flex-row">
          <Link href="/search">
            <Button size="lg" className="rounded-full cursor-pointer">
              <Search />
              Search now
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full cursor-pointer"
            >
              <LogIn />
              Or login if you haven&apos;t...
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
