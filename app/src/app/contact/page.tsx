import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
};

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
            Want to say hi, report a bug, or tell us your file looked at the AI
            funny?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">We’re here for all of it:</p>

          <div className="space-y-6 mt-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">
                  <a
                    href="mailto:support@filedescriptor.wtf"
                    className="hover:underline"
                  >
                    support@filedescriptor.wtf
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
                <p className="text-muted-foreground">Not currently supported</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-5 w-5 text-primary mt-1 flex items-center justify-center">
                🛸
              </div>
              <div>
                <h3 className="font-medium">Alien contact frequency</h3>
                <p className="text-muted-foreground">Still working on it</p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground mt-6">
            We read every message (yes, even the weird ones), so feel free to
            reach out. Whether it’s feedback, feature requests, or digital hugs,
            we’d love to hear from you!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
