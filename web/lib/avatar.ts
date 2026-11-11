const AVATAR_SIZE = 256;
const MAX_SOURCE_BYTES = 10 * 1024 * 1024; // 10 MB before resizing
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const AVATAR_ACCEPT = ACCEPTED_TYPES.join(',');

/**
 * Crops the picked photo to a centred square, resizes it to 256x256 and
 * re-encodes it as JPEG in the browser. Re-encoding also drops the photo's
 * metadata (such as GPS location) before anything is uploaded.
 */
export const prepareAvatar = async (file: File): Promise<string> => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Choose a PNG, JPEG or WebP image.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Choose an image smaller than 10 MB.');
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('That file could not be read as an image.');
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser cannot resize images.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE
  );
  bitmap.close();

  return canvas.toDataURL('image/jpeg', 0.85);
};
