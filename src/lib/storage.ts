import {
  buildObjectKey,
  objectKeyFromFileUrl,
  toFileUrl,
} from './storage-key';

interface StorageObject {
  body: ReadableStream<Uint8Array>;
  httpMetadata?: { contentType?: string };
  size?: number;
}

interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

function getConfig(): SupabaseStorageConfig {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'mardocs';

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase Storage is not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  return { url, serviceRoleKey, bucket };
}

function storageHeaders(config: SupabaseStorageConfig, contentType?: string): Headers {
  const headers = new Headers({
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  });

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  return headers;
}

function objectEndpoint(config: SupabaseStorageConfig, key: string): string {
  return `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

async function responseError(response: Response): Promise<Error> {
  let details = '';
  try {
    details = (await response.text()).slice(0, 300);
  } catch {
    // Keep the HTTP status when the response body is unavailable.
  }
  return new Error(`Supabase Storage request failed (${response.status})${details ? `: ${details}` : ''}`);
}

export function buildDocumentObjectKey(userId: string, fileName: string): string {
  return buildObjectKey(userId, fileName);
}

export async function putObject(
  key: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<{ key: string; fileUrl: string }> {
  const config = getConfig();
  const response = await fetch(objectEndpoint(config, key), {
    method: 'POST',
    headers: storageHeaders(config, contentType),
    body: data as BodyInit,
  });

  if (!response.ok) {
    throw await responseError(response);
  }

  return { key, fileUrl: toFileUrl(config.bucket, key) };
}

export async function getObject(key: string): Promise<StorageObject | null> {
  const config = getConfig();
  const response = await fetch(objectEndpoint(config, key), {
    method: 'GET',
    headers: storageHeaders(config),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !response.body) {
    throw await responseError(response);
  }

  return {
    body: response.body,
    httpMetadata: { contentType: response.headers.get('content-type') || undefined },
    size: Number(response.headers.get('content-length')) || undefined,
  };
}

export async function deleteObjectByUrl(fileUrl: string): Promise<void> {
  const key = objectKeyFromFileUrl(fileUrl);
  if (!key) {
    // Legacy objects (e.g. Vercel Blob) are not managed by Supabase Storage.
    return;
  }

  const config = getConfig();
  const response = await fetch(`${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`, {
    method: 'DELETE',
    headers: storageHeaders(config),
  });

  if (!response.ok && response.status !== 404) {
    throw await responseError(response);
  }
}

export { objectKeyFromFileUrl };
