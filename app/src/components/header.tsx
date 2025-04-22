'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth';
import Avatar from 'boring-avatars';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

export function Header() {
  const {
    state: { isLoading, userInfo },
    logout,
  } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold sm:inline-block">FileDescriptor?</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoading ? (
            <Skeleton className="w-9 h-9 rounded-full" />
          ) : !!userInfo?.username ? (
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full cursor-pointer">
                  <Avatar name={userInfo.username} variant="beam" size={36} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    {userInfo.full_name || userInfo.username}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      router.push('/settings/profile');
                    }}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push('/settings/security');
                    }}
                    className="cursor-pointer"
                  >
                    Security
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ready to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your file description quest will pause here. Feel free to
                    come back anytime!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await logout();
                      router.push('/');
                    }}
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
