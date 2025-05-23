import { ProfileForm } from '@/app/settings/profile/profile-form';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is some of your account&apos;s basic information.
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
