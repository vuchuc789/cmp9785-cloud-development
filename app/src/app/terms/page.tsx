export default function TermsPage() {
  return (
    <div className="grow flex flex-col">
      <div className="flex-1">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">
          <div className="mb-8">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mt-4">
              Terms of Use
            </h1>
            <p className="text-muted-foreground mt-2">
              Last updated: March 25, 2024
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg">
              Welcome to our open-license media search website! By using this
              site, you agree to the following totally reasonable and not-at-all
              overcomplicated terms:
            </p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                You can search for and use open-license media however you like
                (yay freedom!), but we don&apos;t own the content, so don&apos;t
                blame us if you use a cat picture and the cat gets mad.
              </li>
              <li>
                No hacking, breaking, or summoning digital ghosts through our
                platform. Seriously, just be nice.
              </li>
              <li>
                We do our best to keep things running, but if the website
                suddenly decides to take a nap, well… technology, right?
              </li>
              <li>
                If you find a bug, you&apos;re legally (just kidding, but
                morally) obligated to tell us so we can fix it instead of
                blaming aliens.
              </li>
            </ul>

            <p className="mt-6">
              By staying here, you accept these terms. If you don&apos;t, well,
              we&apos;re not stopping you from leaving—but we&apos;ll miss you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
