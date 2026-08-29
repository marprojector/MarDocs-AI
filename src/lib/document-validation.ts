import { z } from 'zod';

export const DocumentStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);

export const DocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).nullable().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().int().nonnegative(),
  fileUrl: z.string().url('Invalid URL'),
  status: DocumentStatusSchema,
  extractedText: z.string().nullable().optional(),
  processedAt: z.date().nullable().optional(),
  processingError: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).nullable().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().int().nonnegative(),
  fileUrl: z.string().url('Invalid URL'),
  status: DocumentStatusSchema.optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
