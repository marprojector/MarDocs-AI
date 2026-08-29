'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarNavigation } from '@/components/layout/sidebar-navigation';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#111415] text-[#e1e3e4] overflow-hidden">
      {/* Desktop Sidebar */}
      <SidebarNavigation 
        user={user} 
        className="w-64 flex-shrink-0 border-r border-[#958da1]/20 hidden lg:flex" 
      />

      {/* Mobile Menu Button - z-50 so it's always above backdrop */}
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-[48px] w-[48px] shadow-xl min-h-[48px] min-w-[48px]"
        >
          <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay - backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden pointer-events-auto"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] max-w-[80vw] bg-[#111415] border-r border-[#958da1]/20 z-50 lg:hidden overflow-y-auto"
            >
              <SidebarNavigation 
                user={user} 
                className="h-full"
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto px-3 py-16 sm:px-4 sm:py-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
