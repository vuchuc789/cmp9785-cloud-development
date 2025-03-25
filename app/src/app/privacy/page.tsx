export default function PrivacyPage() {
  return (
    <div className="grow flex flex-col">
      <div className="flex-1">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">
          <div className="mb-8">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mt-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mt-2">
              Last updated: March 25, 2024
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg">
              Your privacy is important to us! Here&apos;s the deal:
            </p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                We collect as little data as possible. No tracking what kind of
                coffee you like or your deepest secrets.
              </li>
              <li>
                Some non-creepy cookies might be used to keep the site
                functional. No chocolate chip cookies, unfortunately.
              </li>
              <li>
                We don&apos;t sell, trade, or give away your data, not even for
                a lifetime supply of pizza (tempting, though).
              </li>
              <li>
                If you think we have some of your data and want it gone, just
                let us know, and we&apos;ll make it disappear (legally, of
                course).
              </li>
            </ul>

            <p className="mt-6">
              If any of this concerns you, consider wearing a tinfoil hat… or
              just reach out, and we&apos;ll happily clarify!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
