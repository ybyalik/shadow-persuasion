'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface ScreenshotUploadProps {
  onUpload: (file: File) => void;
}

export function ScreenshotUpload({ onUpload }: ScreenshotUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-[#D4A017] bg-[#1A1A1A]' : 'border-gray-600 hover:border-gray-500'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <UploadCloud className="h-12 w-12 mb-4 text-gray-500" />
        {isDragActive ? (
          <p className="text-lg font-semibold">Drop the screenshot here...</p>
        ) : (
          <p className="text-lg font-semibold">Drop a screenshot or click to upload</p>
        )}
        <p className="text-sm text-gray-500">Supports: JPG, PNG, WEBP</p>
      </div>
    </div>
  );
}
