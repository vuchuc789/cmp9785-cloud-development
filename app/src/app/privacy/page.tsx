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
              Last updated: April 22, 2024
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg">
              At <b>FileDescriptor?</b>, your privacy is as important to us as
              correctly identifying whether that blurry image is a dog or a loaf
              of bread.
              <br />
              Here’s how we (responsibly) handle your stuff:
            </p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <b>We don’t spy on your files.</b> Everything you upload is used
                strictly for generating descriptions — no creepy AI training on
                your selfies, we promise.
              </li>
              <li>
                <b>Temporary brainpower.</b> Uploaded files might be processed
                briefly, but we don’t keep them around for midnight snacks.
                They’re deleted after processing, like a respectful digital
                ghost.
              </li>
              <li>
                <b>No selling your data.</b> Your personal info isn’t for sale,
                trade, or used to summon targeted ads about socks you mentioned
                once.
              </li>
              <li>
                <b>Cookies?</b> Only the digital kind (and only to keep the app
                running smoothly). Unfortunately, no chocolate chips involved.
              </li>
            </ul>

            <p className="mt-6">
              If you have questions or want your data gone like your 2012
              Facebook photos — just contact us!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
