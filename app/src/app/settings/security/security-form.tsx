'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import { useAuthRequired } from '@/hooks/auth';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth';
import { useEffect } from 'react';

export function SecurityForm() {
  const form = useForm<z.infer<typeof zUpdateUserForm>>({
    resolver: zodResolver(zUpdateUserForm),
    defaultValues: {
      username: '',
      password: '',
      password_repeat: '',
    },
    mode: 'onChange',
  });

  const {
    state: { userInfo, isLoading },
    updateUser,
  } = useAuth();

  useAuthRequired();

  async function onSubmit(data: z.infer<typeof zUpdateUserForm>) {
    await updateUser(data);
  }

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    form.setValue('username', userInfo.username);
  }, [userInfo, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>Your new password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password_repeat"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password_repeat">Confirm password</FormLabel>
              <FormControl>
                <Input
                  id="password_repeat"
                  type="password"
                  autoComplete="new-password"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>Confirm your new password.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="cursor-pointer">
          Update password
        </Button>
      </form>
    </Form>
  );
}
