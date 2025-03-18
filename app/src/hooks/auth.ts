'use client';

import { useAuth } from '@/contexts/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useAuthRequired() {
  const {
    state: { isLoading, accessToken },
  } = useAuth();
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current || isLoading) {
      return;
    }

    hasChecked.current = true;
    if (!accessToken?.access_token) {
      toast.warning('You have to login to continue');
      router.replace('/login');
    }
  }, [isLoading, accessToken?.access_token, router]);

  return isLoading;
}

export function useAuthNotRequired() {
  const {
    state: { isLoading, accessToken },
  } = useAuth();
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current || isLoading) {
      return;
    }

    hasChecked.current = true;
    if (accessToken?.access_token) {
      toast.info('You have already logged in');
      router.replace('/');
    }
  }, [isLoading, accessToken?.access_token, router]);

  return isLoading;
}
