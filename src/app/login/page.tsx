'use client';

import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Header } from '@/components/layout/header';

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);

    try {
      await signIn(provider, {
        callbackUrl: redirectUrl,
        redirect: true,
      });
    } catch {
      setError('Failed to sign in with ' + provider);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-6">
      <Card className="w-full max-w-md bg-[#1d2021]/50 border-[#958da1]/20">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7c3aed]/20 text-[#d2bbff]">
            <Icon name="BrainCircuit" size={32} />
          </div>
          <CardTitle className="mt-6 text-2xl text-[#e1e3e4]">Welcome to MarDocs</CardTitle>
          <CardDescription className="text-[#ccc3d8]">
            Sign in with your preferred provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <>
                  <Icon name="MailOpen" size={20} className="mr-2" />
                  Sign in with Google
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <>
                  <Icon name="GitBranch" size={20} className="mr-2" />
                  Sign in with GitHub
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="rounded-lg bg-[#ffb4ab]/10 p-3 text-sm text-[#ffb4ab]">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#111415]">
      <Header
        title="Sign In"
        subtitle="Continue with your preferred provider"
      />

      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
