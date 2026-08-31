'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(() =>
    searchParams.get('error') ? 'Authentication failed. Please try again.' : null
  );
  const [providers, setProviders] = useState<string[]>([]);

  const redirectUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    fetch('/api/auth/available-providers', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { providers: [] }))
      .then((data) => setProviders(data.providers || []))
      .catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(redirectUrl);
    }
  }, [status, router, redirectUrl]);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    setIsLoading(provider);

    try {
      await signIn(provider, {
        callbackUrl: redirectUrl,
        redirect: true,
      });
    } catch {
      setError('Failed to start sign-in. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30">
            <Icon name="BrainCircuit" size={32} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#e1e3e4]">
            Welcome to MarDocs
          </h1>
          <p className="mt-2 text-sm text-[#ccc3d8]">
            Your documents, now intelligent. Sign in to continue.
          </p>
        </div>

        <div className="rounded-2xl border border-[#958da1]/20 bg-[#1d2021]/50 p-6 sm:p-8 shadow-xl">
          <div className="space-y-3">
            {providers.includes('google') && (
              <Button
                variant="outline"
                className="w-full h-12 border-[#958da1]/30 bg-[#0c0f10] hover:border-[#7c3aed] hover:bg-[#0c0f10] hover:text-[#e1e3e4]"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading !== null}
              >
                {isLoading === 'google' ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.84z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.66-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.34 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1.75 10.22 1.75 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.16 2.84C6.54 7.31 8.14 5.38 12 5.38z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            )}

            {providers.includes('github') && (
              <Button
                variant="outline"
                className="w-full h-12 border-[#958da1]/30 bg-[#0c0f10] hover:border-[#7c3aed] hover:bg-[#0c0f10] hover:text-[#e1e3e4]"
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading !== null}
              >
                {isLoading === 'github' ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.964.091-.665.35-1.118.636-1.374-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    Continue with GitHub
                  </>
                )}
              </Button>
            )}

            {providers.length === 0 && (
              <div className="rounded-lg bg-[#ffb4ab]/10 p-3 text-sm text-[#ffb4ab]">
                No sign-in providers are currently available. Please try again later.
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-[#ffb4ab]/10 p-3 text-sm text-[#ffb4ab]" role="alert">
              {error}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-[#ccc3d8]">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#ccc3d8] transition-colors hover:text-[#e1e3e4]"
          >
            <Icon name="ArrowLeft" size={14} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#111415]">
          <Icon name="Loader2" size={32} className="animate-spin text-[#7c3aed]" />
        </div>
      }
    >
      <div className="min-h-screen bg-[#111415]">
        <LoginForm />
      </div>
    </Suspense>
  );
}
