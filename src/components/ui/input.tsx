'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Icon } from './icon';

const inputVariants = cva(
  'flex h-12 w-full rounded-md border bg-[#0c0f10] px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#ccc3d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-[#958da1]/30',
        error: 'border-[#ffb4ab]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

const FileUploadArea = ({
  onFileSelect,
  label = 'Drag & drop files here',
  description = 'Supports PDF, DOCX, TXT, and CSV up to 50MB.',
  accept = '.pdf,.docx,.txt,.csv',
  maxFiles = 1,
  className,
}: {
  onFileSelect: (files: FileList | null) => void;
  label?: string;
  description?: string;
  accept?: string;
  maxFiles?: number;
  className?: string;
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFileSelect(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        'group relative cursor-pointer rounded-xl border-2 border-dashed border-[#958da1]/30 bg-[#1d2021]/30 p-8 text-center transition-all duration-300 hover:border-[#7c3aed]/50 hover:bg-[#1d2021]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10',
        isDragging && 'border-[#7c3aed] bg-[#7c3aed]/5',
        className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1d2021] text-[#7c3aed] transition-colors group-hover:bg-[#7c3aed] group-hover:text-white">
          <Icon name="Upload" size={32} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-semibold text-[#e1e3e4]">{label}</h3>
          <p className="text-sm text-[#ccc3d8]">{description}</p>
        </div>
      </div>
    </div>
  );
};

export { Input, FileUploadArea };
