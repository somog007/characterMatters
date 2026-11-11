'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { uploadToCloudinary, type UploadKind } from '@/lib/cloudinaryUpload';

type ContentType = 'video' | 'ebook' | 'gallery';
type Status = { type: 'idle' | 'working' | 'success' | 'error'; text: string };

const VIDEO_ACCEPT = 'video/mp4,video/quicktime,video/webm,video/x-m4v';
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const PDF_ACCEPT = 'application/pdf';

const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'SAPPHIRE', 'DIAMOND', 'PLATINUM'];
const AGE_GROUPS = [
  { value: 'TODDLER', label: 'Ages 2 & 3' },
  { value: 'PRE_K', label: 'Ages 4 & 5' },
  { value: 'SCHOOL_AGE', label: 'Ages 6 - 10' },
];

const inputClass = 'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1';

const apiError = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string; errors?: { message?: string }[] } }; message?: string };
  return err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message || 'Something went wrong';
};

/** Reads a video file's length in seconds without uploading it. */
const videoDuration = (file: File) =>
  new Promise<number>((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Number.isFinite(video.duration) ? Math.round(video.duration) : 0);
    };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });

function FileField({
  id, label, accept, required, onChange,
}: { id: string; label: string; accept: string; required?: boolean; onChange: (file: File | null) => void }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}{required ? ' *' : ' (optional)'}</label>
      <input
        id={id}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
}

export default function UploadContent() {
  const [contentType, setContentType] = useState<ContentType>('video');
  const [status, setStatus] = useState<Status>({ type: 'idle', text: '' });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [formKey, setFormKey] = useState(0);
  const busy = status.type === 'working';

  const setFile = (name: string) => (file: File | null) => setFiles((prev) => ({ ...prev, [name]: file }));

  /** Uploads the file under `name`, if one was chosen, and reports progress. */
  const upload = async (name: string, kind: UploadKind, what: string) => {
    const file = files[name];
    if (!file) return undefined;
    return uploadToCloudinary(file, kind, (percent) =>
      setStatus({ type: 'working', text: `Uploading ${what}… ${percent}%` })
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const text = (key: string) => (data[key]?.trim() ? data[key].trim() : undefined);
    setStatus({ type: 'working', text: 'Starting upload…' });

    try {
      if (contentType === 'video') {
        const videoFile = files.video;
        if (!videoFile) throw new Error('Choose a video file.');
        const durationSeconds = await videoDuration(videoFile);
        const videoUrl = await upload('video', 'video', 'video');
        const thumbnailUrl = await upload('thumbnail', 'thumbnail', 'thumbnail');
        const worksheetUrl = await upload('worksheet', 'worksheet', 'worksheet');
        setStatus({ type: 'working', text: 'Saving lesson…' });
        await api.post('/videos', {
          title: text('title'),
          description: text('description'),
          ageGroup: data.ageGroup,
          accessTier: data.accessTier,
          videoUrl,
          thumbnailUrl,
          worksheetUrl,
          durationSeconds,
        });
      } else if (contentType === 'ebook') {
        const coverUrl = await upload('cover', 'ebookCover', 'cover');
        const fileUrl = await upload('ebookFile', 'ebookFile', 'PDF');
        setStatus({ type: 'working', text: 'Saving eBook…' });
        await api.post('/ebooks', {
          title: text('title'),
          description: text('description'),
          author: text('author'),
          accessTier: data.accessTier,
          coverUrl,
          fileUrl,
        });
      } else {
        const mediaType = data.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE';
        const mediaUrl = await upload('media', mediaType === 'VIDEO' ? 'galleryVideo' : 'galleryImage', mediaType.toLowerCase());
        if (!mediaUrl) throw new Error('Choose a photo or video.');
        setStatus({ type: 'working', text: 'Saving gallery item…' });
        await api.post('/gallery', {
          title: text('title'),
          description: text('description'),
          category: data.category,
          mediaType,
          mediaUrl,
          location: text('location'),
          school: text('school'),
          eventDate: text('eventDate'),
        });
      }

      setStatus({ type: 'success', text: 'Uploaded and saved. ✅' });
      setFiles({});
      setFormKey((key) => key + 1); // clears the form
    } catch (error: unknown) {
      setStatus({ type: 'error', text: apiError(error) });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Upload content</h2>
      <p className="text-sm text-gray-600 mb-4">
        Files go straight to Cloudinary, so large videos are fine. Keep this page open until it says “Uploaded and saved”.
      </p>

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Content type">
        {([
          ['video', 'Video lesson'],
          ['ebook', 'eBook'],
          ['gallery', 'Gallery item'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={contentType === value}
            disabled={busy}
            onClick={() => { setContentType(value); setFiles({}); setStatus({ type: 'idle', text: '' }); }}
            className={`px-4 py-2 rounded font-semibold text-sm ${
              contentType === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form key={`${contentType}-${formKey}`} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className={labelClass}>Title *</label>
          <input id="title" name="title" required minLength={3} maxLength={200} className={inputClass} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Description{contentType === 'video' ? ' * (at least 10 characters)' : ' (optional)'}
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            required={contentType === 'video'}
            minLength={contentType === 'video' ? 10 : undefined}
            maxLength={4000}
            className={inputClass}
          />
        </div>

        {contentType === 'video' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ageGroup" className={labelClass}>Age group</label>
                <select id="ageGroup" name="ageGroup" className={inputClass} defaultValue="TODDLER">
                  {AGE_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="accessTier" className={labelClass}>Package needed to watch</label>
                <select id="accessTier" name="accessTier" className={inputClass} defaultValue="BRONZE">
                  {TIERS.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
            </div>
            <FileField id="video" label="Video file" accept={VIDEO_ACCEPT} required onChange={setFile('video')} />
            <FileField id="thumbnail" label="Thumbnail image" accept={IMAGE_ACCEPT} onChange={setFile('thumbnail')} />
            <FileField id="worksheet" label="Worksheet PDF" accept={PDF_ACCEPT} onChange={setFile('worksheet')} />
          </>
        )}

        {contentType === 'ebook' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="author" className={labelClass}>Author (optional)</label>
                <input id="author" name="author" maxLength={200} className={inputClass} />
              </div>
              <div>
                <label htmlFor="accessTier" className={labelClass}>Package needed to read</label>
                <select id="accessTier" name="accessTier" className={inputClass} defaultValue="BRONZE">
                  {TIERS.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
            </div>
            <FileField id="cover" label="Cover image" accept={IMAGE_ACCEPT} onChange={setFile('cover')} />
            <FileField id="ebookFile" label="eBook PDF" accept={PDF_ACCEPT} onChange={setFile('ebookFile')} />
          </>
        )}

        {contentType === 'gallery' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className={labelClass}>Category</label>
                <select id="category" name="category" className={inputClass} defaultValue="Events">
                  <option value="Events">Events</option>
                  <option value="School Seminars">School Seminars</option>
                </select>
              </div>
              <div>
                <label htmlFor="mediaType" className={labelClass}>Type</label>
                <select id="mediaType" name="mediaType" className={inputClass} defaultValue="IMAGE">
                  <option value="IMAGE">Photo</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div>
                <label htmlFor="school" className={labelClass}>School (optional)</label>
                <input id="school" name="school" maxLength={200} className={inputClass} />
              </div>
              <div>
                <label htmlFor="location" className={labelClass}>Location (optional)</label>
                <input id="location" name="location" maxLength={200} className={inputClass} />
              </div>
              <div>
                <label htmlFor="eventDate" className={labelClass}>Event date (optional)</label>
                <input id="eventDate" name="eventDate" type="date" className={inputClass} />
              </div>
            </div>
            <FileField
              id="media"
              label="Photo or video"
              accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
              required
              onChange={setFile('media')}
            />
          </>
        )}

        {status.text && (
          <p
            role={status.type === 'error' ? 'alert' : 'status'}
            className={`rounded p-3 text-sm ${
              status.type === 'error'
                ? 'bg-red-100 text-red-700'
                : status.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-50 text-blue-800'
            }`}
          >
            {status.text}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Uploading…' : 'Upload and save'}
        </button>
      </form>
    </div>
  );
}
