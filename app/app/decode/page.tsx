'use client';

import { useState } from 'react';
import { ScreenshotUpload } from '@/components/app/ScreenshotUpload';
import { AnalysisResult } from '@/components/app/AnalysisResult';
import { EnhancedAnalysisResult } from '@/components/app/EnhancedAnalysisResult';

// Legacy format
export type LegacyAnalysis = {
    analysis: string;
    suggestions: string[];
    techniques_identified: string[];
};

// Enhanced format
export type EnhancedAnalysis = {
    powerDynamics: {
        userPower: number;
        otherPower: number;
        dynamicsDescription: string;
    };
    communicationStyle: {
        sensoryPreference: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Mixed';
        emotionalState: string;
        receptivity: number;
    };
    responseOptions: {
        type: string;
        message: string;
        description: string;
        powerImpact: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        psychologyPrinciple: string;
    }[];
    overallAnalysis: string;
    successProbability: number;
    techniques_identified: string[];
};

export type Analysis = LegacyAnalysis | EnhancedAnalysis | null;

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
                    Conversation Intelligence — Screenshot Analysis
                </h1>
                <p className="text-gray-400 mt-2 max-w-3xl">
                    Upload a screenshot of any conversation and get instant psychological insights. 
                    We'll analyze who has power, how they communicate, and give you exact responses 
                    that increase your influence using psychology principles from your knowledge base.
                </p>
                
                {/* Quick explainer */}
                <div className="mt-4 bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-[#D4A017] text-[#0A0A0A] rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            💡
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white mb-1">How it works:</p>
                            <p className="text-xs text-gray-400">
                                Upload → We analyze power dynamics & communication style → Get 4 psychology-backed response options → Copy & send
                            </p>
                        </div>
                    </div>
                </div>
            </header>
            
            {!analysis && !isLoading && <ScreenshotUpload onUpload={handleUpload} />}
            
            {isLoading && (
                <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg animate-pulse">
                    <p className="font-mono text-lg">[ANALYZING...]</p>
                </div>
            )}
            
            {error && <div className="text-red-500">{error}</div>}

            {analysis && imagePreview && (
                <>
                    {'powerDynamics' in analysis ? (
                        <EnhancedAnalysisResult analysis={analysis as EnhancedAnalysis} imagePreview={imagePreview} />
                    ) : (
                        <AnalysisResult analysis={analysis as LegacyAnalysis} imagePreview={imagePreview} />
                    )}
                </>
            )}
        </div>
    );
}
