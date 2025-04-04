import { verifyEmailUsersVerifyEmailGet } from '@/client';
import { CircleCheck, CircleX } from 'lucide-react';

export default async function VerifyPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let token = (await searchParams).token;
  if (typeof token !== 'string') {
    token = '';
  }

  const res = await verifyEmailUsersVerifyEmailGet({
    query: { token },
  });

  return (
    <div className="grow flex justify-center items-center flex-col gap-4">
      {res.response.status === 200 ? (
        <p className="flex items-center justify-center gap-2 leading-7 [&:not(:first-child)]:mt-6">
          <CircleCheck /> You&apos;ve verified your email successfully!!
        </p>
      ) : (
        <>
          <p className="flex items-center justify-center gap-2 leading-7 [&:not(:first-child)]:mt-6">
            <CircleX /> Email verification failed with an error:
          </p>
          <p className="text-sm text-muted-foreground">
            {typeof res.error?.detail === 'string'
              ? res.error.detail
              : 'Unknown'}
          </p>
        </>
      )}
    </div>
  );
}
