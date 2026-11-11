import api from '@/lib/api';

export type UploadKind =
  | 'video'
  | 'thumbnail'
  | 'worksheet'
  | 'ebookCover'
  | 'ebookFile'
  | 'galleryImage'
  | 'galleryVideo';

interface SignedUpload {
  uploadUrl: string;
  fields: Record<string, string | number>;
}

/**
 * Uploads a file straight from the browser to Cloudinary, using a one-off
 * signature from the API (admins only). Returns the file's https:// address.
 */
export const uploadToCloudinary = async (
  file: File,
  kind: UploadKind,
  onProgress?: (percent: number) => void
): Promise<string> => {
  let signed: SignedUpload;
  try {
    signed = (await api.post('/admin/uploads/sign', { kind })).data as SignedUpload;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(err.response?.data?.message || 'Could not prepare the upload');
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) form.append(key, String(value));
  form.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', signed.uploadUrl);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let body: { secure_url?: string; error?: { message?: string } } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // handled below
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) resolve(body.secure_url);
      else reject(new Error(body.error?.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed: check your connection and try again'));
    xhr.send(form);
  });
};
