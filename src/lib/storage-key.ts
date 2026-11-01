export const STORAGE_SCHEME = 'supabase://';

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[\u0000-\u001f\u007f]/g, '_')
    .replace(/[/\\]/g, '_')
    .slice(0, 200);
}

export function buildObjectKey(
  userId: string,
  fileName: string,
  timestamp = Date.now(),
): string {
  return `documents/${userId}/${timestamp}-${sanitizeFileName(fileName)}`;
}

export function toFileUrl(bucket: string, key: string): string {
  return `${STORAGE_SCHEME}${bucket}/${key}`;
}

/** Returns the object key for a Supabase storage URL, or null for legacy URLs. */
export function objectKeyFromFileUrl(fileUrl: string): string | null {
  if (!fileUrl.startsWith(STORAGE_SCHEME)) {
    return null;
  }

  const withoutScheme = fileUrl.slice(STORAGE_SCHEME.length);
  const slashIndex = withoutScheme.indexOf('/');
  if (slashIndex === -1 || slashIndex === withoutScheme.length - 1) {
    return null;
  }

  return withoutScheme.slice(slashIndex + 1);
}
