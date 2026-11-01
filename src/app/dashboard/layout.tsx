import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AuthenticatedMainLayout } from '@/components/layout/authenticated-main-layout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return <AuthenticatedMainLayout>{children}</AuthenticatedMainLayout>;
}
