import { HomepageButtons } from '@/components/homepage-buttons';
import Avatar from 'boring-avatars';

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
          Let AI describe your files — no, not <i>that</i>{' '}
          <a
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
            href="https://en.wikipedia.org/wiki/File_descriptor"
            target="_blank"
          >
            file descriptor
          </a>
          .
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Upload mysterious media and let our AI reveal its secrets — whether
          it&apos;s a cat, a concert, or a chaotic selfie.
        </p>

        <HomepageButtons />
      </main>
    </div>
  );
}
