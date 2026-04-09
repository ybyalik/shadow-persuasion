'use client';

import { Send, Image, X } from 'lucide-react';
import { useState, useRef } from 'react';

interface ChatInputProps {
  onSend: (input: string, image?: { file: File; preview: string; base64: string }) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);

    const previewReader = new FileReader();
    previewReader.onload = (ev) => setImagePreview(ev.target?.result as string);
    previewReader.readAsDataURL(file);

    const base64Reader = new FileReader();
    base64Reader.onload = (ev) => setImageBase64(ev.target?.result as string);
    base64Reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || isLoading) return;

    if (imageFile && imagePreview && imageBase64) {
      onSend(input, { file: imageFile, preview: imagePreview, base64: imageBase64 });
    } else {
      onSend(input);
    }
    setInput('');
    removeImage();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Image preview */}
      {imagePreview && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-[#333]">
          <img src={imagePreview} alt="Attached" className="h-16 w-16 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{imageFile?.name}</p>
            <p className="text-[10px] text-gray-400">Image will be analyzed by AI</p>
          </div>
          <button type="button" onClick={removeImage} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-[#D4A017] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#222]"
          title="Attach image"
          disabled={isLoading}
        >
          <Image className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={imageFile ? "Add a message about this image..." : "Ask the Handler..."}
          rows={1}
          className="flex-1 p-2 bg-gray-50 dark:bg-[#222222] text-gray-800 dark:text-[#E8E8E0] placeholder-gray-500 rounded-lg border border-gray-200 dark:border-[#333333] focus:ring-2 focus:ring-[#D4A017] focus:outline-none resize-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="p-2 bg-[#D4A017] text-[#0A0A0A] rounded-full disabled:opacity-50"
          disabled={isLoading || (!input.trim() && !imageFile)}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
