import { SecurityForm } from '@/app/settings/security/security-form';
import { Separator } from '@/components/ui/separator';

export default function SettingsSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Update your password here.
        </p>
      </div>
      <Separator />
      <SecurityForm />
    </div>
  );
}
