'use client';

import { useState, useCallback } from 'react';
import { Upload, BookOpen, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type BookStatus = 'uploading' | 'processing' | 'done' | 'error';
type Book = {
  id: string;
  title: string;
  author: string;
  fileName: string;
  chunks: number;
  status: BookStatus;
  error?: string;
};

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
}

export default function AdminPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.(pdf|txt|md)$/i, '').replace(/[-_]/g, ' '));
      }
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.(pdf|txt|md)$/i, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !author) return;

    setIsProcessing(true);
    const bookId = Date.now().toString();
    
    const newBook: Book = {
      id: bookId,
      title,
      author,
      fileName: selectedFile.name,
      chunks: 0,
      status: 'uploading',
    };
    setBooks(prev => [newBook, ...prev]);

    try {
      // Step 1: Extract text client-side
      setStatusText('Extracting text from file...');
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'uploading' } : b));

      let text = '';
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        text = await extractPdfText(selectedFile);
      } else {
        text = await selectedFile.text();
      }

      if (text.length < 100) {
        throw new Error('Could not extract enough text from file. Try a different format.');
      }

      setStatusText(`Extracted ${text.length.toLocaleString()} characters. Processing chunks...`);
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'processing' } : b));

      // Step 2: Send extracted text to API
      const res = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title, author }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ingestion failed');
      }

      setBooks(prev => prev.map(b => 
        b.id === bookId ? { ...b, status: 'done', chunks: data.chunks } : b
      ));
      setStatusText('');
    } catch (err: any) {
      setBooks(prev => prev.map(b => 
        b.id === bookId ? { ...b, status: 'error', error: err.message } : b
      ));
      setStatusText('');
    }

    setIsProcessing(false);
    setSelectedFile(null);
    setTitle('');
    setAuthor('');
  };

  const handleDelete = async (bookTitle: string, bookId: string) => {
    if (!confirm(`Delete all chunks from "${bookTitle}"?`)) return;
    
    try {
      await fetch('/api/admin/ingest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bookTitle }),
      });
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
          Knowledge Base — Admin
        </h1>
        <p className="text-gray-400 mt-1">Upload books to train the AI knowledge base</p>
      </header>

      <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#333]">
        <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider mb-4">Upload a Book</h2>
        
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${dragActive ? 'border-[#D4A017] bg-[#D4A017]/10' : 'border-[#444] hover:border-[#666]'}
            ${selectedFile ? 'border-green-500/50 bg-green-500/5' : ''}
          `}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="h-6 w-6 text-green-400" />
              <span className="text-green-400 font-mono">{selectedFile.name}</span>
              <span className="text-gray-500 text-sm">({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Drop a PDF, TXT, or MD file here</p>
              <p className="text-gray-600 text-sm mt-1">or click to browse</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Book Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Influence: The Psychology of Persuasion"
              className="w-full p-2.5 bg-[#222] text-[#E8E8E0] border border-[#444] rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:outline-none placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="e.g. Robert Cialdini"
              className="w-full p-2.5 bg-[#222] text-[#E8E8E0] border border-[#444] rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:outline-none placeholder-gray-600"
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || !title || !author || isProcessing}
          className="mt-4 w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider 
            hover:bg-[#E8B030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors
            flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
          ) : (
            <><Upload className="h-5 w-5" /> Ingest Book</>
          )}
        </button>

        {statusText && (
          <p className="text-[#D4A017] text-sm text-center mt-2 font-mono">{statusText}</p>
        )}

        {isProcessing && (
          <p className="text-gray-500 text-sm text-center mt-1">
            This may take a few minutes. Don't close this page.
          </p>
        )}
      </div>

      <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#333]">
        <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider mb-4">Ingested Books</h2>
        
        {books.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No books ingested yet. Upload one above.</p>
        ) : (
          <div className="space-y-3">
            {books.map(book => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-[#222] rounded-lg border border-[#333]">
                <div className="flex items-center gap-3">
                  {book.status === 'processing' && <Loader2 className="h-5 w-5 text-[#D4A017] animate-spin" />}
                  {book.status === 'done' && <CheckCircle className="h-5 w-5 text-green-400" />}
                  {book.status === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {book.status === 'uploading' && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
                  <div>
                    <p className="text-[#E8E8E0] font-medium">{book.title}</p>
                    <p className="text-gray-500 text-sm">{book.author} · {book.fileName}</p>
                    {book.status === 'done' && (
                      <p className="text-green-400 text-xs mt-0.5">{book.chunks} chunks ingested</p>
                    )}
                    {book.status === 'error' && (
                      <p className="text-red-400 text-xs mt-0.5">{book.error}</p>
                    )}
                  </div>
                </div>
                {book.status === 'done' && (
                  <button 
                    onClick={() => handleDelete(book.title, book.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
