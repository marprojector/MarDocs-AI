import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_SCHEME,
  buildObjectKey,
  objectKeyFromFileUrl,
  toFileUrl,
// @ts-expect-error Node's strip-types runner requires the explicit .ts extension.
} from './storage-key.ts';

test('builds a safe per-user object key from a filename', () => {
  const key = buildObjectKey('user-123', '../report\nfinal.pdf', 1700000000000);

  assert.equal(key, 'documents/user-123/1700000000000-.._report_final.pdf');
  assert.ok(!key.includes('\n'));
  assert.ok(!key.includes('\\'));
});

test('round-trips a Supabase file URL into its object key', () => {
  const key = 'documents/user-123/1700000000000-report.pdf';
  const fileUrl = toFileUrl('mardocs', key);

  assert.equal(fileUrl, `${STORAGE_SCHEME}mardocs/${key}`);
  assert.equal(objectKeyFromFileUrl(fileUrl), key);
});

test('does not treat legacy Vercel Blob URLs as Supabase objects', () => {
  assert.equal(
    objectKeyFromFileUrl('https://private.blob.vercel-storage.com/documents/report.pdf'),
    null,
  );
});
