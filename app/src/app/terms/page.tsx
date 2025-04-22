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
              Last updated: April 22, 2024
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg">
              Welcome to <b>FileDescriptor?</b> — the AI-powered file content
              description app that has nothing to do with Linux file descriptors
              (seriously, we get that a lot).
              <br />
              By using this app, you agree to the following incredibly sensible
              and only mildly sarcastic terms:
            </p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                You can upload your media files to get snazzy AI-generated
                descriptions. Just know: we don&apos;t own your files, and we
                don&apos;t take credit for your cat photos unless the AI writes
                an award-winning caption.
              </li>
              <li>
                No hacking, poking around, or trying to make the AI become
                sentient. It’s chill and prefers describing memes to plotting
                world domination.
              </li>
              <li>
                We do our best to keep the app awake and responsive, but if it
                falls asleep mid-description, blame the cloud (or the AI&apos;s
                coffee shortage).
              </li>
              <li>
                Found a bug? You&apos;re not legally bound, but you&apos;re
                morally heroic if you tell us instead of blaming quantum
                fluctuations.
              </li>
            </ul>

            <p className="mt-6">
              By continuing to use <b>FileDescriptor?</b>, you&apos;re agreeing
              to all this. If not, feel free to leave—but just know the AI was
              starting to warm up to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
