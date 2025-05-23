'use client';

import { zCreateUserForm } from '@/client/zod.gen';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth';
import { useAuthNotRequired } from '@/hooks/auth';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const form = useForm<z.infer<typeof zCreateUserForm>>({
    resolver: zodResolver(zCreateUserForm),
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      password_repeat: '',
    },
    mode: 'onChange',
  });

  const [fullname, email] = useWatch({
    control: form.control,
    name: ['full_name', 'email'],
  });

  const router = useRouter();
  const {
    signup,
    state: { isLoading },
  } = useAuth();

  useAuthNotRequired();

  const onSubmit = async (values: z.infer<typeof zCreateUserForm>) => {
    const isSuccessed = await signup(values);
    if (isSuccessed) {
      router.push('/login');
    }
  };

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

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign up a new account</CardTitle>
          <CardDescription>
            Enter your information below to sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <div className="grid gap-3">
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <FormControl>
                        <Input
                          id="username"
                          placeholder="johndoe"
                          type="text"
                          autoComplete="username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <div className="grid gap-3">
                      <FormLabel htmlFor="full_name">Full name</FormLabel>
                      <FormControl>
                        <Input
                          id="full_name"
                          placeholder="John Doe (optional)"
                          type="text"
                          autoComplete="name"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <div className="grid gap-3">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@example.com (optional)"
                          type="email"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <div className="grid gap-3">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password_repeat"
                  render={({ field }) => (
                    <div className="grid gap-3">
                      <FormLabel htmlFor="password-repeat">
                        Confirm password
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="password-repeat"
                          type="password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Sign up
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline underline-offset-4">
                  Log in
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
