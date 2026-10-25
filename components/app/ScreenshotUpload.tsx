'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X } from 'lucide-react';

export const MAX_SCREENSHOTS = 5;

interface ScreenshotUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
}

/** Add up to 5 screenshots of a conversation, with small previews you can remove. */
export function ScreenshotUpload({ files, onChange, max = MAX_SCREENSHOTS }: ScreenshotUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted.length) return;
      onChange([...files, ...accepted].slice(0, max));
    },
    [files, onChange, max]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'] },
    multiple: true,
    disabled: files.length >= max,
  });

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  return (
    <div>
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {previews.map((src, i) => (
            <div key={src} className="relative h-24 w-20 overflow-hidden rounded-lg border border-[color:var(--app-line)] bg-[color:var(--app-paper-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                aria-label={`Remove screenshot ${i + 1}`}
                className="absolute right-0 top-0 flex h-11 w-11 items-start justify-end p-1"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--app-night)] text-[#efe9df]">
                  <X className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
      {files.length < max && (
        <div
          {...getRootProps()}
          className={`flex min-h-[64px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-center text-[15px] transition-colors ${
            isDragActive
              ? 'border-[color:var(--app-accent)] bg-[color:var(--app-paper-2)]'
              : 'border-[color:var(--app-line)] text-[color:var(--app-muted)] hover:border-[color:var(--app-accent)]'
          }`}
        >
          <input {...getInputProps()} />
          <ImagePlus className="h-5 w-5 shrink-0" />
          <span>
            {files.length ? `Add another screenshot (${files.length} of ${max})` : `Add screenshots of the conversation (up to ${max})`}
          </span>
        </div>
      )}
    </div>
  );
}
