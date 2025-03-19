'use client';

import { zPasswordResetForm } from '@/client/zod.gen';
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
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export function ResetPasswordForm({
  token,
  className,
  ...props
}: React.ComponentProps<'div'> & { token: string }) {
  const form = useForm<z.infer<typeof zPasswordResetForm>>({
    resolver: zodResolver(zPasswordResetForm),
    defaultValues: {
      password: '',
      password_repeat: '',
    },
  });

  const router = useRouter();
  const {
    resetPassword,
    state: { isLoading },
  } = useAuth();

  useAuthNotRequired();

  const onSubmit = async (values: z.infer<typeof zPasswordResetForm>) => {
    const isSuccessed = await resetPassword(token, values);
    if (isSuccessed) {
      router.push('/login');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Fill in below passwords to reset</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
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

                {/* <div className="flex flex-col gap-3"> */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
