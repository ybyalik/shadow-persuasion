'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/lib/subscription';
import { Save, Loader2, Check, RotateCcw, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { Button, Card, Label, Notice, PageHeader, inputClass } from '@/components/app/ui';

const TONE_OPTIONS = ['Professional', 'Casual', 'Friendly', 'Direct', 'Diplomatic', 'Assertive', 'Warm'];

export default function SettingsPage() {
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [personality, setPersonality] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [tones, setTones] = useState<string[]>([]);
  const [sampleTexts, setSampleTexts] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ name: string; preview: string }[]>([]);

  const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
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
    setSaveError(null);
    try {
      const headers = await getHeaders();
      const samples = sampleTexts
        .split(/\n-{3,}\n/)
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/user/voice-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          personality,
          writingStyle,
          tone: tones.join(', '),
          sampleTexts: samples,
        }),
      });
      if (!res.ok) throw new Error('save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save voice profile:', e);
      setSaveError("We couldn't save your voice profile. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.customerId) return;
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: subscription.customerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Failed to open billing portal:', e);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleResetOnboarding = () => {
    // Today reads ?welcome=1 and opens the welcome screen again.
    window.location.href = '/app?welcome=1';
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--app-gold)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageHeader kicker="Settings" title="Your account" subtitle="Your account, your app access, and how replies should sound." />

      <div className="space-y-5">
        {/* Account */}
        <Card>
          <Label>Account</Label>
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--app-gold)] text-lg font-bold text-[#0b0a08]">
                {(user?.displayName || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[17px] font-semibold">{user?.displayName || 'You'}</p>
              <p className="truncate text-[15px] text-[color:var(--app-muted)]">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* App access and billing */}
        <Card>
          <Label>Your app access</Label>
          {subLoading ? (
            <p className="flex items-center gap-2 text-[15px] text-[color:var(--app-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your access...
            </p>
          ) : subscription?.active ? (
            <div className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <Fact label="Plan">{subscription.plan === 'app_monthly' ? 'Monthly ($9.99)' : 'Monthly'}</Fact>
                <Fact label="Status">{STATUS_LABEL[subscription.status || ''] || 'Active'}</Fact>
                {subscription.currentPeriodEnd && (
                  <Fact label="Next billing date">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </Fact>
                )}
                <Fact label="Billing email">{user?.email}</Fact>
              </dl>
              <Button variant="ghost" onClick={handleManageSubscription} loading={portalLoading}>
                {!portalLoading && <ExternalLink className="h-4 w-4" />}
                {portalLoading ? 'Opening...' : 'Manage or cancel'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed">
                No monthly subscription. If your book came with 60 days of the app, you can see how many are left, and keep the app afterwards, on the Keep the app page.
              </p>
              <Button href="/app/keep" variant="gold">
                Keep the app
              </Button>
            </div>
          )}
        </Card>

        {/* How replies should sound */}
        <Card>
          <Label>How replies should sound</Label>
          <p className="mb-5 text-[15px] leading-relaxed text-[color:var(--app-muted)]">
            The calm replies and lines the app writes for you will sound more like you. Everything here is optional.
          </p>

          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-semibold">What you&apos;re like</span>
              <textarea
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="e.g. Kind but direct. I don't like being pushy. I use a little humor when things get tense."
                rows={3}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-semibold">How you usually write</span>
              <textarea
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                placeholder="e.g. Short sentences, casual. I say 'honestly' a lot. No office jargon."
                rows={3}
                className={inputClass}
              />
            </label>

            <div>
              <span className="mb-2 block text-[15px] font-semibold">Tone</span>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <button key={tone} type="button" onClick={() => toggleTone(tone)} aria-pressed={tones.includes(tone)} className={chip(tones.includes(tone))}>
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block">
                <span className="mb-1.5 block text-[15px] font-semibold">Messages you&apos;ve written</span>
                <span className="mb-2 block text-[14px] text-[color:var(--app-muted)]">
                  Paste a few, with a line of three dashes (---) between them. Or add screenshots and the app will copy the words out.
                </span>
                <textarea
                  value={sampleTexts}
                  onChange={(e) => setSampleTexts(e.target.value)}
                  placeholder={
                    "Hi Sarah, just following up on Tuesday. I think we're on the same page. Let me know if you need anything from me before Friday.\n\n---\n\nHonestly, let's just go for it. Waiting another month won't change much."
                  }
                  rows={6}
                  className={inputClass}
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[color:var(--app-line)] px-4 text-[15px] hover:bg-[color:var(--app-paper-2)]">
                  <ImageIcon className="h-4 w-4" />
                  Add screenshots
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
                {extracting && (
                  <span className="flex items-center gap-2 text-[14px] text-[color:var(--app-muted)]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Reading the screenshot...
                  </span>
                )}
              </div>
              {uploadedImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img.preview} alt={img.name} className="h-16 w-16 rounded-lg border border-[color:var(--app-line)] object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label="Remove screenshot"
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--app-ink)] text-[color:var(--app-paper)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[14px] text-[color:var(--app-muted)]">Only add messages you&apos;re comfortable keeping in the app.</p>
            </div>

            {saveError && <Notice tone="error">{saveError}</Notice>}

            <Button onClick={handleSave} loading={saving}>
              {!saving && (saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />)}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </Card>

        {/* Welcome screen */}
        <Card>
          <Label>Welcome screen</Label>
          <p className="mb-4 text-[15px] leading-relaxed text-[color:var(--app-muted)]">
            See the short welcome again, to change what you want help with and how replies should sound.
          </p>
          <Button variant="ghost" onClick={handleResetOnboarding}>
            <RotateCcw className="h-4 w-4" /> Show the welcome again
          </Button>
        </Card>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  trialing: 'Free trial',
  past_due: 'Payment overdue',
  canceled: 'Cancelled',
  unpaid: 'Payment overdue',
};

const chip = (on: boolean) =>
  `min-h-[44px] rounded-full border px-4 text-[15px] transition-colors ${
    on ? 'border-[color:var(--app-ink)] bg-[color:var(--app-ink)] text-[color:var(--app-paper)]' : 'border-[color:var(--app-line)] hover:bg-[color:var(--app-paper-2)]'
  }`;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[color:var(--app-paper-2)] px-4 py-3">
      <dt className="app-type text-[11px] uppercase tracking-[0.16em] text-[color:var(--app-muted)]">{label}</dt>
      <dd className="mt-0.5 truncate text-[15px] font-medium">{children}</dd>
    </div>
  );
}
