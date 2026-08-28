'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { SidebarNavigation } from '@/components/layout/sidebar-navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex h-screen bg-[#111415] text-[#e1e3e4]">
      <SidebarNavigation 
        user={user} 
        className="w-64 flex-shrink-0 border-r border-[#958da1]/20 hidden md:block" 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
