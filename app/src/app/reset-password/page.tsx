import { EmailForm } from './email-form';
import { ResetPasswordForm } from './reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let token = (await searchParams).token;
  if (typeof token !== 'string') {
    token = '';
  }

  return (
    <div className="flex grow items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {!token ? <EmailForm /> : <ResetPasswordForm token={token} />}
      </div>
    </div>
  );
}
