'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const user = session?.user;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your account"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Profile</CardTitle>
            <CardDescription className="text-[#ccc3d8]">Your signed-in account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#7c3aed]/20 text-[#d2bbff]">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name ?? 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold">{user?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-medium text-[#e1e3e4]">{user?.name ?? 'User'}</h3>
                <p className="truncate text-sm text-[#ccc3d8]">{user?.email ?? 'No email available'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Appearance</CardTitle>
            <CardDescription className="text-[#ccc3d8]">MarDocs currently uses dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg bg-[#0c0f10] p-4">
              <Icon name="Moon" size={20} className="text-[#d2bbff]" />
              <div>
                <p className="text-sm font-medium text-[#e1e3e4]">Dark mode</p>
                <p className="text-xs text-[#ccc3d8]">The available MarDocs theme</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-[#1d2021]/50 border-[#958da1]/20">
          <CardHeader>
            <CardTitle className="text-[#e1e3e4]">Account actions</CardTitle>
            <CardDescription className="text-[#ccc3d8]">Manage your current session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? <Icon name="Loader2" size={16} className="mr-2 animate-spin" /> : <Icon name="LogOut" size={16} className="mr-2" />}
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
