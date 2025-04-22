'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { LogIn, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const HomepageButtons: React.FC = () => {
  const {
    state: { accessToken, isLoading },
  } = useAuth();

  const router = useRouter();

  return (
    <div className="flex gap-4 items-start flex-col sm:flex-row">
      <Button
        size="lg"
        className="rounded-full cursor-pointer"
        onClick={() => {
          if (isLoading) {
            return;
          }

          if (!accessToken) {
            router.push('/login');
          } else {
            router.push('/files');
          }
        }}
      >
        <Search />
        Describe now
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="rounded-full cursor-pointer"
        onClick={() => {
          if (isLoading) {
            return;
          }

          if (!accessToken) {
            router.push('/login');
          } else {
            toast.info('You have already logged in');
          }
        }}
      >
        <LogIn />
        Or login if your files are shy...
      </Button>
    </div>
  );
};
