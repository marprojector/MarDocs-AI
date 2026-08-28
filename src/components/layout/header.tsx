'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const Header = ({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) => {
  return (
    <header className={cn('mb-8', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-[#e1e3e4] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#ccc3d8]">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
};
