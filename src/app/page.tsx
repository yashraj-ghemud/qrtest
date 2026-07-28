'use client';

/**
 * QRcraft — main studio page.
 *
 * Brings together:
 *  - Data-driven category picker (16 types)
 *  - Dynamic form
 *  - Customization panel (colors, templates, logo, ECC)
 *  - Live QR canvas with heartbeat
 *  - History panel (localStorage)
 *  - QR scanner (camera + image upload)
 *  - AI assistant (chat with memory)
 *  - AI Smart Design
 *  - AI Image-to-QR (vision OCR)
 *  - Tracked QR creation (scan analytics)
 *  - Batch generation (CSV -> ZIP)
 *  - Konami code easter egg, Web Share, type-to-preview
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  QrCode, Sparkles, Scan, History, Wand2, BarChart3, Share2, Download,
  Upload, Loader2, Trash2, Copy, Check, Image as ImageIcon, X, Zap,
  FileText, Layers,
  Globe as GlobeIcon, Instagram as InstagramIcon, Mail as MailIcon,
  Phone as PhoneIcon, MessageSquare as MessageSquareIcon, Wifi as WifiIcon,
  Contact as ContactIcon, MapPin as MapPinIcon, Youtube as YoutubeIcon,
  Twitter as TwitterIcon, Linkedin as LinkedinIcon, Briefcase as BriefcaseIcon,
} from 'lucide-react';
import {
  categories, getCategory, type CategoryDef,
} from '@/lib/qr/categories';
import {
  DEFAULT_CUSTOMIZATION, type QRCustomization,
  renderQRSvg, renderQRPng, renderQRThumbnail,
  downloadDataUrl, downloadSvg,
} from '@/lib/qr/render';
import {
  loadHistory, addToHistory, deleteHistoryItem, clearHistory,
  type HistoryItem,
} from '@/lib/qr/history';
import { DynamicForm } from '@/components/qr/DynamicForm';
import { CustomizationPanel } from '@/components/qr/CustomizationPanel';
import { QRCanvas } from '@/components/qr/QRCanvas';
import { QRScanner } from '@/components/qr/QRScanner';
import { AIChat, type AISuggestion } from '@/components/ai/AIChat';
import { AnalyticsDashboard } from '@/components/ai/AnalyticsDashboard';

type Tab = 'studio' | 'scan' | 'analytics';

interface Toast {
  id: string;
  msg: string;
  kind: 'ok' | 'err' | 'info';
}

export default function Home() {
  // --- State ---
  const [tab, setTab] = useState<Tab>('studio');
  const [activeCategoryId, setActiveCategoryId] = useState('url');
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [customization, setCustomization] = useState<QRCustomization>(
    DEFAULT_CUSTOMIZATION,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [aiDesignLoading, setAiDesignLoading] = useState(false);
  const [imageToQrLoading, setImageToQrLoading] = useState(false);
  const [trackedLoading, setTrackedLoading] = useState(false);
  const [trackedUrl, setTrackedUrl] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showBatch, setShowBatch] = useState(false);
  const [konami, setKonami] = useState(false);

  const activeCategory = useMemo<CategoryDef>(
    () => getCategory(activeCategoryId) || categories[0],
    [activeCategoryId],
  );

  // --- Derived QR content ---
  const content = useMemo(() => {
    try {
      return activeCategory.encode(values) || '';
    } catch {
      return '';
    }
  }, [activeCategory, values]);

  const validationError = useMemo(() => {
    if (!content) return null;
    return activeCategory.validate(values);
  }, [activeCategory, values, content]);

  // --- Toast helper ---
  const toast = useCallback((msg: string, kind: Toast['kind'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // --- Load history on mount ---
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // --- Listen for cross-field autofill events from DynamicForm ---
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        fieldId: string;
        value: string;
      };
      if (detail?.fieldId) {
        setValues((prev) => ({ ...prev, [detail.fieldId]: detail.value }));
      }
    };
    window.addEventListener('qrcraft:autofill', handler);
    return () => window.removeEventListener('qrcraft:autofill', handler);
  }, []);

  // --- Konami code easter egg (↑↑↓↓←→←→BA) ---
  useEffect(() => {
    const seq = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
    ];
    let idx = 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === seq[idx]) {
        idx++;
        if (idx === seq.length) {
          setKonami(true);
          setCustomization((c) => ({
            ...c,
            template: 'gradient',
            gradientFrom: '#ff00ff',
            gradientTo: '#00ffff',
            foreground: '#ff00ff',
            background: '#0a0014',
          }));
          toast('🌈 Rainbow mode unlocked!', 'ok');
          idx = 0;
        }
      } else {
        idx = 0;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toast]);

  // --- Apply AI suggestion from chat ---
  const applySuggestion = useCallback(
    (s: AISuggestion) => {
      if (s.suggestedCategory) {
        const cat = getCategory(s.suggestedCategory);
        if (cat) {
          setActiveCategoryId(s.suggestedCategory);
          if (s.suggestedFields) {
            setValues(s.suggestedFields);
          }
        } else {
          toast(`Unknown category: ${s.suggestedCategory}`, 'err');
        }
      }
      if (s.suggestedCustomization) {
        setCustomization((c) => ({
          ...c,
          ...s.suggestedCustomization,
          errorCorrection:
            s.suggestedCustomization?.template === 'gradient'
              ? 'H'
              : c.errorCorrection,
        }) as QRCustomization);
      }
      setChatOpen(false);
      toast('AI suggestion applied 🎨', 'ok');
    },
    [toast],
  );

  // --- Save to history ---
  const handleSave = useCallback(async () => {
    if (validationError) {
      toast(validationError, 'err');
      return;
    }
    if (!content) {
      toast('Nothing to save yet — fill the form.', 'err');
      return;
    }
    let thumbnail: string | undefined;
    try {
      thumbnail = await renderQRThumbnail(content, customization);
    } catch {
      /* thumbnail optional */
    }
    const items = addToHistory({
      category: activeCategory.id,
      content,
      label: activeCategory.preview ? activeCategory.preview(values) : content.slice(0, 60),
      thumbnail,
      customization: {
        foreground: customization.foreground,
        background: customization.background,
        errorCorrection: customization.errorCorrection,
        size: customization.size,
        template: customization.template,
        gradientFrom: customization.gradientFrom,
        gradientTo: customization.gradientTo,
      },
    });
    setHistory(items);
    toast('Saved to history', 'ok');
  }, [activeCategory, content, customization, toast, validationError, values]);

  // --- Download PNG ---
  const handleDownloadPng = useCallback(async () => {
    if (!content) {
      toast('Fill the form first', 'err');
      return;
    }
    try {
      const { pngDataUrl } = await renderQRPng(content, customization);
      downloadDataUrl(pngDataUrl, `qrcraft-${activeCategory.id}-${Date.now()}.png`);
      toast('PNG downloaded', 'ok');
    } catch (e) {
      toast(`PNG export failed: ${(e as Error).message}`, 'err');
    }
  }, [activeCategory, content, customization, toast]);

  // --- Download SVG ---
  const handleDownloadSvg = useCallback(() => {
    if (!content) {
      toast('Fill the form first', 'err');
      return;
    }
    try {
      const { svg } = renderQRSvg(content, customization);
      downloadSvg(svg, `qrcraft-${activeCategory.id}-${Date.now()}.svg`);
      toast('SVG downloaded', 'ok');
    } catch (e) {
      toast(`SVG export failed: ${(e as Error).message}`, 'err');
    }
  }, [activeCategory, content, customization, toast]);

  // --- Copy content ---
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast('Content copied to clipboard', 'ok');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('Clipboard blocked by browser', 'err');
    }
  }, [content, toast]);

  // --- Web Share API ---
  const handleShare = useCallback(async () => {
    if (!content) {
      toast('Fill the form first', 'err');
      return;
    }
    try {
      const { pngDataUrl } = await renderQRPng(content, customization);
      const res = await fetch(pngDataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'qrcraft.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My QR code',
          text: activeCategory.preview ? activeCategory.preview(values) : 'Scan me!',
          files: [file],
        });
        toast('Shared!', 'ok');
      } else if (navigator.share) {
        await navigator.share({
          title: 'My QR code',
          text: content,
        });
        toast('Shared!', 'ok');
      } else {
        toast('Web Share not supported on this browser', 'err');
      }
    } catch (e) {
      const err = e as Error;
      if (err.name !== 'AbortError') {
        toast(`Share failed: ${err.message}`, 'err');
      }
    }
  }, [activeCategory, content, customization, toast, values]);

  // --- AI Smart Design ---
  const handleAIDesign = useCallback(async () => {
    if (!content) {
      toast('Fill the form first so AI has context', 'err');
      return;
    }
    setAiDesignLoading(true);
    try {
      const res = await fetch('/api/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCategory.id,
          content: content.slice(0, 200),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCustomization((c) => ({
        ...c,
        template: (data.template as QRCustomization['template']) || c.template,
        foreground: data.foreground || c.foreground,
        background: data.background || c.background,
        gradientFrom: data.gradientFrom || c.gradientFrom,
        gradientTo: data.gradientTo || c.gradientTo,
        errorCorrection:
          data.template === 'gradient' || data.template === 'dots'
            ? 'H'
            : c.errorCorrection,
      }));
      toast(data.rationale || 'Design applied', 'ok');
    } catch (e) {
      toast(`AI design failed: ${(e as Error).message}`, 'err');
    } finally {
      setAiDesignLoading(false);
    }
  }, [activeCategory, content, toast]);

  // --- AI Image-to-QR (vision OCR) ---
  const imageInputRef = useRef<HTMLInputElement>(null);
  const handleImageToQr = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageToQrLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = String(reader.result);
          try {
            const res = await fetch('/api/ai/image-to-qr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: dataUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            if (data.ok && data.content) {
              // Switch to text category and populate
              setActiveCategoryId('text');
              setValues({ text: data.content });
              toast(
                `Decoded as ${data.type}. Switched to Text category.`,
                'ok',
              );
            } else {
              toast(data.message || 'No QR found in image', 'err');
            }
          } catch (err) {
            toast(`Image-to-QR failed: ${(err as Error).message}`, 'err');
          } finally {
            setImageToQrLoading(false);
          }
        };
        reader.onerror = () => {
          toast('Could not read file', 'err');
          setImageToQrLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        toast(`Upload failed: ${(err as Error).message}`, 'err');
        setImageToQrLoading(false);
      }
      if (imageInputRef.current) imageInputRef.current.value = '';
    },
    [toast],
  );

  // --- Create tracked QR (for analytics) ---
  const handleCreateTracked = useCallback(async () => {
    if (!content) {
      toast('Fill the form first', 'err');
      return;
    }
    if (!/^https?:\/\//i.test(content)) {
      toast(
        'Tracking works best with URL QRs. Other types will show a landing page on scan.',
        'info',
      );
    }
    setTrackedLoading(true);
    try {
      const res = await fetch('/api/qr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          category: activeCategory.id,
          label: activeCategory.preview ? activeCategory.preview(values) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setTrackedUrl(data.trackableUrl);
      toast('Tracked QR created!', 'ok');
    } catch (e) {
      toast(`Tracking setup failed: ${(e as Error).message}`, 'err');
    } finally {
      setTrackedLoading(false);
    }
  }, [activeCategory, content, toast, values]);

  // --- Delete from history ---
  const handleDeleteHistory = useCallback((id: string) => {
    const next = deleteHistoryItem(id);
    setHistory(next);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
    toast('History cleared', 'ok');
  }, [toast]);

  // --- Restore from history ---
  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    setActiveCategoryId(item.category);
    setValues({});
    // Wait a tick so category fields init, then set content via text trick:
    // For simplicity, switch to 'text' if the category's fields don't accept content directly.
    setTimeout(() => {
      // Heuristic: most categories have a primary content field; we set the
      // raw content into the 'text' category for easy re-edit.
      setActiveCategoryId('text');
      setValues({ text: item.content });
    }, 30);
    setCustomization((c) => ({
      ...c,
      foreground: item.customization.foreground,
      background: item.customization.background,
      errorCorrection:
        (item.customization.errorCorrection as QRCustomization['errorCorrection']) || 'M',
      template:
        (item.customization.template as QRCustomization['template']) || 'classic',
      gradientFrom: item.customization.gradientFrom,
      gradientTo: item.customization.gradientTo,
    }));
    setTab('studio');
    toast('Loaded from history — switch category to re-parse', 'info');
  }, [toast]);

  // --- Render ---
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Aurora background blobs */}
      <div className="aurora-blob" style={{ width: 500, height: 500, top: -100, left: -100, background: '#22d3ee' }} />
      <div className="aurora-blob" style={{ width: 600, height: 600, top: 200, right: -200, background: '#a855f7' }} />
      <div className="aurora-blob" style={{ width: 400, height: 400, bottom: -100, left: '40%', background: '#ec4899' }} />

      <div className="relative z-10">
        {/* Top Nav */}
        <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-pink-500 shadow-lg shadow-cyan-500/30">
                <QrCode className="h-5 w-5 text-white" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
                </span>
              </div>
              <div>
                <h1 className="text-base font-bold leading-none text-white">
                  QR<span className="text-gradient">craft</span>
                </h1>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-400">
                  AI QR Studio
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-1" aria-label="Primary">
              <NavTab active={tab === 'studio'} onClick={() => setTab('studio')} icon={<Wand2 className="h-4 w-4" />} label="Studio" />
              <NavTab active={tab === 'scan'} onClick={() => setTab('scan')} icon={<Scan className="h-4 w-4" />} label="Scan" />
              <NavTab active={tab === 'analytics'} onClick={() => setTab('analytics')} icon={<BarChart3 className="h-4 w-4" />} label="Analytics" />
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-400"
                aria-expanded={chatOpen}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Assistant
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {tab === 'studio' && (
            <StudioTab
              activeCategory={activeCategory}
              activeCategoryId={activeCategoryId}
              setActiveCategoryId={setActiveCategoryId}
              values={values}
              setValues={setValues}
              customization={customization}
              setCustomization={setCustomization}
              content={content}
              validationError={validationError}
              formError={formError}
              setFormError={setFormError}
              history={history}
              onRestore={handleRestoreHistory}
              onDelete={handleDeleteHistory}
              onClear={handleClearHistory}
              onSave={handleSave}
              onDownloadPng={handleDownloadPng}
              onDownloadSvg={handleDownloadSvg}
              onCopy={handleCopy}
              copied={copied}
              onShare={handleShare}
              onAIDesign={handleAIDesign}
              aiDesignLoading={aiDesignLoading}
              onImageToQr={handleImageToQr}
              imageToQrLoading={imageToQrLoading}
              imageInputRef={imageInputRef}
              onCreateTracked={handleCreateTracked}
              trackedLoading={trackedLoading}
              trackedUrl={trackedUrl}
              setTrackedUrl={setTrackedUrl}
              konami={konami}
            />
          )}

          {tab === 'scan' && (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">QR Scanner</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Scan with your camera or upload an image. Decoded content is sent back to the Studio.
                </p>
              </div>
              <QRScanner
                onResult={(c) => {
                  setActiveCategoryId('text');
                  setValues({ text: c });
                  setTab('studio');
                  toast('QR decoded — opened in Studio', 'ok');
                }}
              />
            </div>
          )}

          {tab === 'analytics' && (
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Scan Analytics</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Real-time scan data for your tracked QR codes — plus AI-generated insights.
                </p>
              </div>
              <AnalyticsDashboard />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/5 px-4 py-6 text-center text-xs text-slate-500 sm:px-6">
          <p>
            QRcraft · Built with Next.js · AI by Groq + OpenRouter ·
            {' '}Strictly uses only:{' '}
            <span className="text-slate-400">gpt-oss-120b</span>,{' '}
            <span className="text-slate-400">gpt-oss-20b</span>,{' '}
            <span className="text-slate-400">qwen-3.6-27b</span>,{' '}
            <span className="text-slate-400">nemotron-3-ultra-550b:free</span>,{' '}
            <span className="text-slate-400">gemma-4-31b-it</span>.
          </p>
        </footer>
      </div>

      {/* AI Chat drawer */}
      {chatOpen && (
        <aside
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md glass-strong border-l border-white/10 shadow-2xl"
          aria-label="AI Assistant"
          role="dialog"
          aria-modal="true"
        >
          <AIChat
            onApplySuggestion={applySuggestion}
            onClose={() => setChatOpen(false)}
          />
        </aside>
      )}

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto animate-fade-in-up rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${t.kind === 'ok'
                ? 'bg-emerald-500 text-white'
                : t.kind === 'err'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700 text-white'
              }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Sub-components ---

function NavTab({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${active
          ? 'bg-white/10 text-white shadow-inner'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400`}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

interface StudioTabProps {
  activeCategory: CategoryDef;
  activeCategoryId: string;
  setActiveCategoryId: (id: string) => void;
  values: Record<string, string | boolean>;
  setValues: (v: Record<string, string | boolean>) => void;
  customization: QRCustomization;
  setCustomization: (c: QRCustomization | ((prev: QRCustomization) => QRCustomization)) => void;
  content: string;
  validationError: string | null;
  formError: string | null;
  setFormError: (e: string | null) => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onSave: () => void;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onCopy: () => void;
  copied: boolean;
  onShare: () => void;
  onAIDesign: () => void;
  aiDesignLoading: boolean;
  onImageToQr: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageToQrLoading: boolean;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  onCreateTracked: () => void;
  trackedLoading: boolean;
  trackedUrl: string | null;
  setTrackedUrl: (s: string | null) => void;
  konami: boolean;
}

function StudioTab(props: StudioTabProps) {
  const {
    activeCategory, activeCategoryId, setActiveCategoryId,
    values, setValues, customization, setCustomization,
    content, validationError, formError, setFormError,
    history, onRestore, onDelete, onClear,
    onSave, onDownloadPng, onDownloadSvg, onCopy, copied, onShare,
    onAIDesign, aiDesignLoading,
    onImageToQr, imageToQrLoading, imageInputRef,
    onCreateTracked, trackedLoading, trackedUrl, setTrackedUrl,
    konami,
  } = props;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr_300px]">
      {/* Left: Category picker + Form */}
      <section
        aria-labelledby="cat-heading"
        className="glass rounded-2xl p-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
      >
        <h2 id="cat-heading" className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-300">
          <Layers className="h-4 w-4 text-cyan-400" />
          Content Type
        </h2>
        <CategoryPicker
          activeId={activeCategoryId}
          onSelect={(id) => {
            setActiveCategoryId(id);
            setValues({});
            setFormError(null);
          }}
        />

        <div className="my-4 h-px bg-white/5" suppressHydrationWarning />

        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          {activeCategory.label} · Fields
        </h3>
        <p className="mb-3 text-[11px] text-slate-500">{activeCategory.description}</p>
        <DynamicForm
          category={activeCategory}
          values={values}
          onChange={(v) => {
            setValues(v);
            setFormError(null);
          }}
          error={formError || validationError}
        />
      </section>

      {/* Center: QR preview + actions */}
      <section
        aria-labelledby="preview-heading"
        className="space-y-4"
      >
        <h2 id="preview-heading" className="sr-only">QR Preview</h2>

        {/* AI Image-to-QR button */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onImageToQr}
            aria-label="Upload QR image for AI OCR decoding"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={imageToQrLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200 hover:bg-fuchsia-500/20 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-400"
          >
            {imageToQrLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
            AI Image-to-QR
          </button>
          {konami && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-2.5 py-1 text-[10px] font-bold text-white">
              <Zap className="h-3 w-3" />
              Rainbow mode
            </span>
          )}
        </div>

        {/* QR Canvas */}
        <div className="glass rounded-2xl p-6">
          <div className="flex min-h-[420px] items-center justify-center">
            {content ? (
              <QRCanvas
                content={content}
                customization={customization}
                beat
                glitch={konami}
              />
            ) : (
              <div className="text-center text-slate-500">
                <QrCode className="mx-auto mb-3 h-16 w-16 opacity-30" />
                <p className="text-sm">Fill the form to generate your QR.</p>
                <p className="mt-1 text-[11px]">Or ask the AI Assistant →</p>
              </div>
            )}
          </div>

          {/* Content preview */}
          {content && (
            <div className="mt-4 rounded-lg border border-white/5 bg-black/30 p-3">
              <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
                <span>Encoded content</span>
                <button
                  onClick={onCopy}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                  aria-label="Copy encoded content"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code className="block max-h-20 overflow-y-auto break-all text-[11px] text-slate-300">
                {content}
              </code>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionBtn onClick={onSave} icon={<History className="h-3.5 w-3.5" />}>Save</ActionBtn>
            <ActionBtn onClick={onDownloadPng} icon={<Download className="h-3.5 w-3.5" />} primary>PNG</ActionBtn>
            <ActionBtn onClick={onDownloadSvg} icon={<Download className="h-3.5 w-3.5" />}>SVG</ActionBtn>
            <ActionBtn onClick={onShare} icon={<Share2 className="h-3.5 w-3.5" />}>Share</ActionBtn>
            <ActionBtn
              onClick={onCreateTracked}
              icon={trackedLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="h-3.5 w-3.5" />}
              disabled={trackedLoading}
            >
              Track scans
            </ActionBtn>
          </div>

          {/* Tracked URL display */}
          {trackedUrl && (
            <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest text-emerald-400">
                  Tracked URL — encode THIS into your QR
                </div>
                <button
                  onClick={() => setTrackedUrl(null)}
                  className="text-slate-400 hover:text-white"
                  aria-label="Dismiss tracked URL"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <code className="block break-all text-[11px] text-emerald-200">
                {trackedUrl}
              </code>
              <p className="mt-1.5 text-[10px] text-emerald-300/70">
                Tip: replace your QR content with this URL to track scans in the Analytics tab.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Right: Customization + History */}
      <section
        aria-labelledby="custom-heading"
        className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
      >
        <div className="glass rounded-2xl p-4">
          <h2 id="custom-heading" className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-300">
            <Wand2 className="h-4 w-4 text-fuchsia-400" />
            Design
          </h2>
          <CustomizationPanel
            value={customization}
            onChange={(c) => setCustomization(c)}
            onAIDesign={onAIDesign}
            aiLoading={aiDesignLoading}
          />
        </div>

        {/* History */}
        <div className="glass rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-300">
              <History className="h-4 w-4 text-cyan-400" />
              History
            </h2>
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="text-[10px] text-slate-500 hover:text-red-400"
                aria-label="Clear all history"
              >
                Clear all
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-slate-500">
              No saved QRs yet. Click <strong>Save</strong> after generating.
            </p>
          ) : (
            <ul className="space-y-2">
              {history.slice(0, 12).map((item) => (
                <li key={item.id}>
                  <div className="group flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-2 hover:border-cyan-400/40">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-10 w-10 rounded border border-white/10 object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-white/10 bg-black/30">
                        <QrCode className="h-5 w-5 text-slate-500" />
                      </div>
                    )}
                    <button
                      onClick={() => onRestore(item)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                        {item.label || item.content.slice(0, 30)}
                      </div>
                      <div className="text-[9px] uppercase tracking-wide text-slate-500">
                        {item.category} · {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-400"
                      aria-label="Delete history item"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function CategoryPicker({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="grid grid-cols-4 gap-1.5"
      role="radiogroup"
      aria-label="QR content type"
    >
      {categories.map((cat) => {
        const Icon = iconFor(cat.icon);
        const active = cat.id === activeId;
        return (
          <button
            key={cat.id}
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(cat.id)}
            title={cat.label}
            className={`group flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-1 transition ${active
                ? 'border-cyan-400 bg-cyan-500/15 text-white'
                : 'border-white/5 bg-black/20 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-400`}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{ background: active ? cat.color + '30' : 'transparent' }}
            >
              <Icon className="h-4 w-4" style={{ color: active ? cat.color : undefined }} />
            </span>
            <span className="text-[9px] font-medium leading-tight">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ActionBtn({
  children, icon, onClick, primary, disabled,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${primary
          ? 'bg-cyan-500 text-white hover:bg-cyan-600'
          : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
        } disabled:opacity-50`}
    >
      {icon}
      {children}
    </button>
  );
}

// Map lucide icon names to components
function iconFor(name: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const map: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    Type: FileText,
    Globe: GlobeIcon,
    Instagram: InstagramIcon,
    MessageCircle: MessageSquareIcon,
    Mail: MailIcon,
    Phone: PhoneIcon,
    MessageSquare: MessageSquareIcon,
    Wifi: WifiIcon,
    Contact: ContactIcon,
    MapPin: MapPinIcon,
    Youtube: YoutubeIcon,
    Twitter: TwitterIcon,
    Linkedin: LinkedinIcon,
    Briefcase: BriefcaseIcon,
    Image: ImageIcon,
    FileText: FileText,
  };
  return map[name] || QrCode;
}
