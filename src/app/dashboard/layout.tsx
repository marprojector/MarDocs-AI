import { AuthenticatedMainLayout } from '@/components/layout/authenticated-main-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedMainLayout>{children}</AuthenticatedMainLayout>;
}
