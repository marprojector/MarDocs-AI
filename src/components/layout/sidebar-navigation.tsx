'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const navigationLinks = [
  { name: 'Documents', href: '/dashboard/documents', icon: 'FileText' },
  { name: 'Recent Chats', href: '/dashboard/chats', icon: 'MessageCircle' },
  { name: 'Favorites', href: '/dashboard/favorites', icon: 'Star' },
  { name: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
];

const sidebarLinks = [
  { name: 'Help', href: '/dashboard/help', icon: 'HelpCircle' },
];

export const SidebarNavigation = ({
  className,
  user,
  onNavigate,
}: {
  className?: string;
  user?: { name?: string | null; email?: string | null; image?: string | null };
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className={cn('flex h-full flex-col gap-2', className)}>
      <div className="mb-6 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed] text-white">
            <Icon name="BrainCircuit" size={20} />
          </div>
          <span className="text-xl font-semibold text-[#e1e3e4]">MarDocs</span>
        </Link>
      </div>

      <div className="flex-1 space-y-1 px-3">
        {navigationLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#7c3aed]/10 text-[#d2bbff]'
                  : 'text-[#ccc3d8] hover:bg-[#1d2021] hover:text-[#e1e3e4]'
              )}
            >
              <Icon
                name={link.icon as string}
                size={18}
                className={cn(isActive && 'text-[#7c3aed]')}
              />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-[#958da1]/20 px-3 py-4">
        {sidebarLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            onClick={handleLinkClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#ccc3d8] hover:bg-[#1d2021] hover:text-[#e1e3e4] transition-all duration-200"
          >
            <Icon name={link.icon} size={18} />
            {link.name}
          </Link>
        ))}

        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#ccc3d8] hover:bg-[#1d2021] hover:text-[#e1e3e4] transition-all duration-200"
          >
            <Icon name="LogOut" size={18} />
            Sign Out
          </button>
        )}

        {user && (
          <div className="mt-4 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#7c3aed]/20 text-[#d2bbff]">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icon name="User" size={18} />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#e1e3e4]">
                {user.name ?? 'User'}
              </p>
              <p className="truncate text-xs text-[#ccc3d8]">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

