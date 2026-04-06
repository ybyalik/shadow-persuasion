'use client';

import { useState } from 'react';
import { Copy, Lightbulb, Zap } from 'lucide-react';

interface RewriteResult {
    versions: {
        type: string;
        description: string;
        message: string;
        explanation: string;
        powerIncrease: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    }[];
    originalPowerScore: number;
    confidence: number;
}

export default function RewritePage() {
    const [originalMessage, setOriginalMessage] = useState('');
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RewriteResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const goals = [
        'Build Authority & Credibility',
        'Create Urgency & Motivation', 
        'Establish Rapport & Connection',
        'Redirect Frame & Control',
        'Generate Reciprocity & Obligation',
        'Increase Intrigue & Interest'
    ];

    const handleRewrite = async () => {
        if (!originalMessage.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/rewrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: originalMessage,
                    goal: goal || 'General Improvement'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to rewrite message');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        // TODO: Add toast notification
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'text-green-400 bg-green-400/10';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
            case 'HIGH': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
                    Message Rewriter — Influence Optimization
                </h1>
                <p className="text-gray-400 mt-2">
                    Transform weak messages into psychologically optimized communications
                </p>
            </header>

            {/* Input Section */}
            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333333] space-y-4">
                <div>
                    <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                        Original Message
                    </label>
                    <textarea
                        value={originalMessage}
                        onChange={(e) => setOriginalMessage(e.target.value)}
                        placeholder="Hey, how was your day? I had a pretty good day today. What are you up to?"
                        className="w-full h-32 bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#D4A017]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                        Goal (Optional)
                    </label>
                    <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white focus:outline-none focus:border-[#D4A017]"
                    >
                        <option value="">Select your objective...</option>
                        {goals.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleRewrite}
                    disabled={!originalMessage.trim() || isLoading}
                    className="w-full bg-[#D4A017] text-[#0A0A0A] font-mono uppercase py-3 px-4 rounded-md hover:bg-[#F4D03F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? '[REWRITING...]' : '🔄 REWRITE MESSAGE'}
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center p-10 border-2 border-dashed border-[#D4A017] rounded-lg animate-pulse">
                    <p className="font-mono text-lg">[ANALYZING & OPTIMIZING...]</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Metrics */}
                    <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333333]">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-[#D4A017]">{result.confidence}%</div>
                                <div className="text-sm font-mono uppercase text-gray-400">Processing Confidence</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-400">
                                    +{Math.max(...result.versions.map(v => v.powerIncrease))}%
                                </div>
                                <div className="text-sm font-mono uppercase text-gray-400">Max Power Increase</div>
                            </div>
                        </div>
                    </div>

                    {/* Rewritten Versions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-mono uppercase text-[#D4A017]">
                            Optimized Versions
                        </h2>
                        
                        {result.versions.map((version, index) => (
                            <div key={index} className="bg-[#1A1A1A] p-6 rounded-lg border border-[#333333] space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-mono uppercase text-[#D4A017] font-bold">
                                            {version.type}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-mono ${getRiskColor(version.riskLevel)}`}>
                                            {version.riskLevel} RISK
                                        </span>
                                    </div>
                                    <div className="text-sm font-mono text-gray-400">
                                        Power: +{version.powerIncrease}%
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-300">{version.description}</p>

                                {/* Rewritten Message */}
                                <div className="bg-[#222222] p-4 rounded-md relative group">
                                    <p className="text-white font-medium">{version.message}</p>
                                    <button
                                        onClick={() => handleCopy(version.message)}
                                        className="absolute top-3 right-3 p-2 bg-[#333333] rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#444444]"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Explanation */}
                                <div className="flex items-start gap-2 bg-[#0A0A0A] p-3 rounded-md">
                                    <Lightbulb className="h-4 w-4 text-[#D4A017] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-300">{version.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}