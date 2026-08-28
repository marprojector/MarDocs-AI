'use client';

import { MainLayout } from '@/components/layout/main-layout';

export function AuthenticatedMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
