'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface Conversation {
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
}

interface AddConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (conversation: Conversation) => void;
}

export function AddConversationModal({ isOpen, onClose, onAdd }: AddConversationModalProps) {
    const [formData, setFormData] = useState<Conversation>({
        personName: '',
        context: '',
        lastInteraction: '',
        communicationStyle: {
            sensoryPreference: 'Mixed',
            emotionalPattern: '',
            receptivity: 50,
        },
        techniques: [],
        nextRecommendedAction: '',
        relationship: 'Professional',
        riskLevel: 'LOW',
        notes: '',
        tags: [],
    });

    const [newTag, setNewTag] = useState('');
    const [newTechnique, setNewTechnique] = useState({ name: '', effectiveness: 50 });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.personName.trim()) return;
        
        onAdd(formData);
        
        // Reset form
        setFormData({
            personName: '',
            context: '',
            lastInteraction: '',
            communicationStyle: {
                sensoryPreference: 'Mixed',
                emotionalPattern: '',
                receptivity: 50,
            },
            techniques: [],
            nextRecommendedAction: '',
            relationship: 'Professional',
            riskLevel: 'LOW',
            notes: '',
            tags: [],
        });
        setNewTag('');
        setNewTechnique({ name: '', effectiveness: 50 });
        
        onClose();
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const addTechnique = () => {
        if (newTechnique.name.trim()) {
            setFormData(prev => ({
                ...prev,
                techniques: [...prev.techniques, {
                    ...newTechnique,
                    name: newTechnique.name.trim(),
                    lastUsed: new Date().toISOString().split('T')[0]
                }]
            }));
            setNewTechnique({ name: '', effectiveness: 50 });
        }
    };

    const removeTechnique = (index: number) => {
        setFormData(prev => ({
            ...prev,
            techniques: prev.techniques.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#333333]">
                    <h2 className="text-xl font-mono uppercase text-[#D4A017]">Add New Conversation</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#333333] rounded transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                                Person Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.personName}
                                onChange={(e) => setFormData(prev => ({ ...prev, personName: e.target.value }))}
                                className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                                Relationship Type
                            </label>
                            <select
                                value={formData.relationship}
                                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value as any }))}
                                className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                            >
                                <option value="Professional">Professional</option>
                                <option value="Personal">Personal</option>
                                <option value="Romantic">Romantic</option>
                                <option value="Client">Client</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                            Context / Situation
                        </label>
                        <textarea
                            value={formData.context}
                            onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                            className="w-full h-24 bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#D4A017]"
                            placeholder="Describe the context of your interactions..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                            Last Interaction Summary
                        </label>
                        <textarea
                            value={formData.lastInteraction}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastInteraction: e.target.value }))}
                            className="w-full h-20 bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#D4A017]"
                            placeholder="Brief summary of your most recent interaction..."
                        />
                    </div>

                    {/* Communication Style */}
                    <div>
                        <h3 className="text-lg font-mono uppercase text-[#D4A017] mb-4">Communication Style</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                                    Sensory Preference
                                </label>
                                <select
                                    value={formData.communicationStyle.sensoryPreference}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        communicationStyle: {
                                            ...prev.communicationStyle,
                                            sensoryPreference: e.target.value as any
                                        }
                                    }))}
                                    className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                                >
                                    <option value="Visual">Visual (sees, looks, pictures)</option>
                                    <option value="Auditory">Auditory (hears, sounds, tells)</option>
                                    <option value="Kinesthetic">Kinesthetic (feels, touches, grasps)</option>
                                    <option value="Mixed">Mixed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                                    Influence Receptivity ({formData.communicationStyle.receptivity}%)
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.communicationStyle.receptivity}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        communicationStyle: {
                                            ...prev.communicationStyle,
                                            receptivity: parseInt(e.target.value)
                                        }
                                    }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Resistant</span>
                                    <span>Highly Receptive</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                                Emotional Pattern
                            </label>
                            <input
                                type="text"
                                value={formData.communicationStyle.emotionalPattern}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    communicationStyle: {
                                        ...prev.communicationStyle,
                                        emotionalPattern: e.target.value
                                    }
                                }))}
                                className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                                placeholder="e.g., Anxious when pressured, confident in expertise areas..."
                            />
                        </div>
                    </div>

                    {/* Techniques */}
                    <div>
                        <h3 className="text-lg font-mono uppercase text-[#D4A017] mb-4">Effective Techniques</h3>
                        
                        {formData.techniques.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {formData.techniques.map((technique, index) => (
                                    <div key={index} className="flex items-center justify-between bg-[#222222] p-3 rounded">
                                        <span className="text-white">{technique.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">{technique.effectiveness}%</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTechnique(index)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTechnique.name}
                                onChange={(e) => setNewTechnique(prev => ({ ...prev, name: e.target.value }))}
                                className="flex-1 bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                                placeholder="Technique name..."
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={newTechnique.effectiveness}
                                onChange={(e) => setNewTechnique(prev => ({ ...prev, effectiveness: parseInt(e.target.value) }))}
                                className="w-20"
                            />
                            <span className="text-sm text-gray-400 w-12 flex items-center">{newTechnique.effectiveness}%</span>
                            <button
                                type="button"
                                onClick={addTechnique}
                                className="p-3 bg-[#D4A017] text-[#0A0A0A] rounded hover:bg-[#F4D03F] transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Next Action & Risk */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                                Risk Level
                            </label>
                            <select
                                value={formData.riskLevel}
                                onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                                className="w-full bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                            >
                                <option value="LOW">Low Risk</option>
                                <option value="MEDIUM">Medium Risk</option>
                                <option value="HIGH">High Risk</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                            Next Recommended Action
                        </label>
                        <textarea
                            value={formData.nextRecommendedAction}
                            onChange={(e) => setFormData(prev => ({ ...prev, nextRecommendedAction: e.target.value }))}
                            className="w-full h-20 bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#D4A017]"
                            placeholder="What should you do next in this relationship?"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                            Tags
                        </label>
                        
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="bg-[#333333] text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="flex-1 bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017]"
                                placeholder="Add tags..."
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="p-3 bg-[#333333] text-white rounded hover:bg-[#444444] transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-mono uppercase text-[#D4A017] mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full h-24 bg-[#222222] border border-[#333333] rounded-md p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#D4A017]"
                            placeholder="Additional notes about this person or relationship..."
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#333333]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#D4A017] text-[#0A0A0A] rounded-lg font-semibold hover:bg-[#F4D03F] transition-colors"
                        >
                            Add Conversation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}