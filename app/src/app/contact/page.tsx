'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="grow mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight mt-4">
          Contact Us
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Got questions, feedback, or just want to say hi?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">We&apos;d love to hear from you!</p>

          <div className="space-y-6 mt-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">
                  <a
                    href="mailto:totally.real.support@mediasearch.com"
                    className="hover:underline"
                  >
                    totally.real.support@mediasearch.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 text-primary mt-1 flex items-center justify-center">
                🐦
              </div>
              <div>
                <h3 className="font-medium">Carrier Pigeon</h3>
                <p className="text-muted-foreground">
                  If you can train one, we&apos;ll be impressed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 text-primary mt-1 flex items-center justify-center">
                🧠
              </div>
              <div>
                <h3 className="font-medium">Telepathy</h3>
                <p className="text-muted-foreground">
                  We&apos;re working on it, but results may vary.
                </p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground mt-6">
            If we don&apos;t respond right away, we&apos;re probably busy
            improving the site (or making memes). We&apos;ll get back to you as
            soon as we can!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
