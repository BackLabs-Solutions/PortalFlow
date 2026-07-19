import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'project-files';

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
]);

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function uploadFile(
  projectId: string,
  originalName: string,
  mimeType: string,
  buffer: Buffer
): Promise<{ url: string; key: string }> {
  const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const key = `${projectId}/${uuid()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(key, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);

  return { url: data.publicUrl, key };
}

export async function deleteFile(key: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([key]);
  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`);
  }
}
