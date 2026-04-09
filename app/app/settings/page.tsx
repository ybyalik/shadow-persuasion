'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Save, Loader2, Check, User, Mic, RotateCcw, Upload, Image, X } from 'lucide-react';

const TONE_OPTIONS = ['Professional', 'Casual', 'Friendly', 'Direct', 'Diplomatic', 'Assertive', 'Warm'];

export default function SettingsPage() {
  const { user } = useAuth();
  const [personality, setPersonality] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [tones, setTones] = useState<string[]>([]);
  const [sampleTexts, setSampleTexts] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ name: string; preview: string }[]>([]);

  const getHeaders = useCallback(async () => {
    const token = await user?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  // Load existing voice profile
  useEffect(() => {
    const load = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch('/api/user/voice-profile', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.voiceProfile) {
            setPersonality(data.voiceProfile.personality || '');
            setWritingStyle(data.voiceProfile.writingStyle || '');
            setTones(data.voiceProfile.tone ? data.voiceProfile.tone.split(', ') : []);
            setSampleTexts(data.voiceProfile.sampleTexts?.join('\n\n---\n\n') || '');
          }
        }
      } catch (e) {
        console.error('Failed to load voice profile:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getHeaders]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setExtracting(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      // Show preview
      const preview = URL.createObjectURL(file);
      setUploadedImages(prev => [...prev, { name: file.name, preview }]);

      // Extract text via API
      try {
        const formData = new FormData();
        formData.append('image', file);
        const headers = await getHeaders();
        const res = await fetch('/api/user/voice-profile/extract', {
          method: 'POST',
          headers: { ...headers },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.extractedText) {
            setSampleTexts(prev => {
              const separator = prev.trim() ? '\n\n---\n\n' : '';
              return prev + separator + data.extractedText;
            });
          }
        }
      } catch (err) {
        console.error('Failed to extract text from image:', err);
      }
    }

    setExtracting(false);
    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTone = (tone: string) => {
    setTones(prev => prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers = await getHeaders();
      const samples = sampleTexts
        .split(/\n-{3,}\n/)
        .map(s => s.trim())
        .filter(Boolean);

      await fetch('/api/user/voice-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          personality,
          writingStyle,
          tone: tones.join(', '),
          sampleTexts: samples,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save voice profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleResetOnboarding = () => {
    if (!confirm('This will show the onboarding flow next time you visit the dashboard. Continue?')) return;
    localStorage.setItem('shadow-force-onboarding', 'true');
    window.location.href = '/app';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-[#D4A017]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold uppercase font-mono tracking-wider">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your profile and preferences</p>
      </header>

      {/* Account Info */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-[#D4A017]" />
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider font-bold">Account</h2>
        </div>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#D4A017] flex items-center justify-center text-[#0A0A0A] text-lg font-bold">
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user?.displayName || 'Operator'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Voice Profile */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg p-5">
        <div className="flex items-center gap-3 mb-1">
          <Mic className="h-5 w-5 text-[#D4A017]" />
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider font-bold">Your Voice Profile</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Every script, response, and recommendation will sound like YOU — not a robot.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">Personality</label>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="e.g., Direct and confident, but empathetic. I don't like being pushy. I use humor to defuse tension."
              className="w-full h-20 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-lg p-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">Communication Style</label>
            <textarea
              value={writingStyle}
              onChange={(e) => setWritingStyle(e.target.value)}
              placeholder="e.g., Short sentences, casual tone. I say 'honestly' and 'look' a lot. I avoid corporate jargon."
              className="w-full h-20 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-lg p-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  onClick={() => toggleTone(tone)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    tones.includes(tone)
                      ? 'bg-[#D4A017] text-[#0A0A0A] border-[#D4A017] font-bold'
                      : 'bg-gray-50 dark:bg-[#222] border-gray-300 dark:border-[#444] text-gray-600 dark:text-gray-300 hover:border-[#D4A017]'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1.5">
              Sample Messages <span className="normal-case font-sans">(paste text or upload screenshots of messages you&apos;ve written)</span>
            </label>
            <textarea
              value={sampleTexts}
              onChange={(e) => setSampleTexts(e.target.value)}
              placeholder={"Hey Sarah, just wanted to follow up on our conversation from Tuesday. I think we're aligned on the approach — let me know if you need anything from my end before the deadline.\n\n---\n\nHonestly, I think we should just go for it. The numbers make sense and waiting another quarter isn't going to change anything."}
              className="w-full h-36 bg-gray-50 dark:bg-[#111] border border-gray-300 dark:border-[#444] rounded-lg p-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A017] resize-none"
            />
            {/* Image upload for samples */}
            <div className="mt-3 flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 text-xs font-mono border border-gray-300 dark:border-[#444] rounded-lg cursor-pointer text-gray-600 dark:text-gray-300 hover:border-[#D4A017] hover:text-[#D4A017] transition-all bg-gray-50 dark:bg-[#222]">
                <Image className="h-4 w-4" />
                Upload Screenshots
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {extracting && (
                <span className="flex items-center gap-2 text-xs text-[#D4A017] font-mono">
                  <Loader2 className="h-3 w-3 animate-spin" /> Extracting text from image...
                </span>
              )}
            </div>
            {uploadedImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.preview} alt={img.name} className="h-16 w-16 object-cover rounded-lg border border-gray-300 dark:border-[#444]" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Upload screenshots of emails, texts, or DMs you&apos;ve sent. AI will extract the text and learn your voice.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-[#D4A017] text-[#0A0A0A] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-[#E8B830] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check className="h-4 w-4" /> Saved!</>
            ) : (
              <><Save className="h-4 w-4" /> Save Voice Profile</>
            )}
          </button>
        </div>
      </div>

      {/* Re-run Onboarding */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg p-5">
        <div className="flex items-center gap-3 mb-1">
          <RotateCcw className="h-5 w-5 text-[#D4A017]" />
          <h2 className="font-mono text-sm text-[#D4A017] uppercase tracking-wider font-bold">Onboarding</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Re-run the initial setup flow to update your goals and voice profile.
        </p>
        <button
          onClick={handleResetOnboarding}
          className="px-4 py-2 text-sm font-mono border border-gray-300 dark:border-[#444] rounded-lg text-gray-600 dark:text-gray-300 hover:border-[#D4A017] hover:text-[#D4A017] transition-all"
        >
          Re-run Onboarding
        </button>
      </div>
    </div>
  );
}
