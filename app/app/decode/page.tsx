'use client';

import { useState } from 'react';
import { ScreenshotUpload } from '@/components/app/ScreenshotUpload';
import { AnalysisResult } from '@/components/app/AnalysisResult';

export type Analysis = {
    analysis: string;
    suggestions: string[];
    techniques_identified: string[];
} | null;

export default function DecodePage() {
    const [analysis, setAnalysis] = useState<Analysis>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (file: File) => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/decode', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to analyze screenshot.');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
                    Decode — Conversation Analysis
                </h1>
            </header>
            
            {!analysis && !isLoading && <ScreenshotUpload onUpload={handleUpload} />}
            
            {isLoading && (
                <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg animate-pulse">
                    <p className="font-mono text-lg">[ANALYZING...]</p>
                </div>
            )}
            
            {error && <div className="text-red-500">{error}</div>}

            {analysis && imagePreview && (
                <AnalysisResult analysis={analysis} imagePreview={imagePreview} />
            )}
        </div>
    );
}
