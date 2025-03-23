'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { zUpdateUserForm } from '@/client/zod.gen';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth';
import { useAuthRequired } from '@/hooks/auth';
import { useEffect } from 'react';

export function ProfileForm() {
  const form = useForm<z.infer<typeof zUpdateUserForm>>({
    resolver: zodResolver(zUpdateUserForm),
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
    },
    mode: 'onChange',
  });

  const [fullname, email] = useWatch({
    control: form.control,
    name: ['full_name', 'email'],
  });

  const {
    state: { userInfo, isLoading },
    updateUser,
    verifyEmail,
  } = useAuth();

  useAuthRequired();

  async function onSubmit(data: z.infer<typeof zUpdateUserForm>) {
    await updateUser(data);
  }

  useEffect(() => {
    if (fullname === '') {
      form.clearErrors('full_name');
      form.setValue('full_name', null);
    }
  }, [fullname, form]);

  useEffect(() => {
    if (email === '') {
      form.clearErrors('email');
      form.setValue('email', null);
    }
  }, [email, form]);

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    form.setValue('username', userInfo.username);
    form.setValue('full_name', userInfo.full_name ?? null);
    form.setValue('email', userInfo.email ?? null);
  }, [userInfo, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                This is your real name, which is optional and different from
                your username.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="flex gap-1 flex-nowrap">
                <FormControl>
                  <Input
                    placeholder="johndoe@example.com"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <Button
                  variant="outline"
                  type="button"
                  disabled={
                    isLoading ||
                    !userInfo?.email ||
                    userInfo.email !== email ||
                    userInfo.email_verification_status === 'verified'
                  }
                  onClick={async () => {
                    await verifyEmail();
                  }}
                  className="cursor-pointer"
                >
                  {userInfo?.email_verification_status === 'verified'
                    ? 'Verified'
                    : 'Verify'}
                </Button>
              </div>
              <FormDescription>
                This is your email, which is optional but required when you want
                to reset your password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="cursor-pointer">
          Update profile
        </Button>
      </form>
    </Form>
  );
}
