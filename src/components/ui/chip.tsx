'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[#1d2021] text-[#ccc3d8] border border-[#958da1]/20',
        primary: 'bg-[#7c3aed]/10 text-[#d2bbff] border border-[#7c3aed]/30',
        accent: 'bg-[#d2bbff]/10 text-[#d2bbff] border border-[#d2bbff]/30',
        outline: 'bg-transparent text-[#ccc3d8] border border-[#958da1]/30',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        default: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(chipVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Chip.displayName = 'Chip';

export { Chip, chipVariants };
