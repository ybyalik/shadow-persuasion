'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Brain, Target } from 'lucide-react';
import { ConversationCard } from '@/components/app/ConversationCard';
import { AddConversationModal } from '@/components/app/AddConversationModal';

interface Conversation {
    id: string;
    personName: string;
    context: string;
    lastInteraction: string;
    communicationStyle: {
        sensoryPreference: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Mixed';
        emotionalPattern: string;
        receptivity: number;
    };
    techniques: {
        name: string;
        effectiveness: number;
        lastUsed: string;
    }[];
    nextRecommendedAction: string;
    relationship: 'Professional' | 'Personal' | 'Romantic' | 'Client' | 'Other';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    notes: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRelationship, setFilterRelationship] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load conversations from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('shadow-persuasion-conversations');
        if (stored) {
            try {
                setConversations(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to load conversations:', e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save to localStorage whenever conversations change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('shadow-persuasion-conversations', JSON.stringify(conversations));
        }
    }, [conversations, isLoading]);

    const handleAddConversation = (conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newConversation: Conversation = {
            ...conversationData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setConversations(prev => [newConversation, ...prev]);
    };

    const handleUpdateConversation = (id: string, updates: Partial<Conversation>) => {
        setConversations(prev => 
            prev.map(conv => 
                conv.id === id 
                    ? { ...conv, ...updates, updatedAt: new Date().toISOString() }
                    : conv
            )
        );
    };

    const handleDeleteConversation = (id: string) => {
        setConversations(prev => prev.filter(conv => conv.id !== id));
    };

    // Filter conversations
    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            conv.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            conv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = !filterRelationship || conv.relationship === filterRelationship;
        
        return matchesSearch && matchesFilter;
    });

    // Group by relationship type for stats
    const stats = conversations.reduce((acc, conv) => {
        acc[conv.relationship] = (acc[conv.relationship] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalConversations = conversations.length;
    const activeConversations = conversations.filter(conv => {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(conv.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceUpdate <= 7;
    }).length;

    const avgReceptivity = conversations.length > 0 
        ? Math.round(conversations.reduce((sum, conv) => sum + conv.communicationStyle.receptivity, 0) / conversations.length)
        : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A017]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">
                        Conversation Intelligence
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Track relationship dynamics, communication patterns, and influence strategies
                    </p>
                </div>
                
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Conversation
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalConversations}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Total Contacts</p>
                        </div>
                        <Eye className="h-8 w-8 text-[#D4A017]" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-green-400">{activeConversations}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Active (7 days)</p>
                        </div>
                        <Target className="h-8 w-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-blue-400">{avgReceptivity}%</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Avg Receptivity</p>
                        </div>
                        <Brain className="h-8 w-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-[#333333]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-purple-400">{Object.keys(stats).length}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase">Relationship Types</p>
                        </div>
                        <Filter className="h-8 w-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations, names, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                    />
                </div>
                
                <select
                    value={filterRelationship}
                    onChange={(e) => setFilterRelationship(e.target.value)}
                    className="px-4 py-2 bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#333333] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                >
                    <option value="">All Relationships</option>
                    <option value="Professional">Professional</option>
                    <option value="Personal">Personal</option>
                    <option value="Romantic">Romantic</option>
                    <option value="Client">Client</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Conversations Grid */}
            {filteredConversations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredConversations.map((conversation) => (
                        <ConversationCard
                            key={conversation.id}
                            conversation={conversation}
                            onUpdate={(updates) => handleUpdateConversation(conversation.id, updates)}
                            onDelete={() => handleDeleteConversation(conversation.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    {searchTerm || filterRelationship ? (
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No conversations match your filters</p>
                            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-6xl">🧠</div>
                            <div>
                                <h3 className="text-xl font-bold text-[#D4A017] mb-2">
                                    Start Building Your Conversation Intelligence
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    Track important relationships, communication patterns, and influence strategies 
                                    to improve your success rate over time.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#D4A017] text-[#0A0A0A] px-6 py-3 rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
                            >
                                Add Your First Conversation
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add Conversation Modal */}
            <AddConversationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddConversation}
            />
        </div>
    );
}