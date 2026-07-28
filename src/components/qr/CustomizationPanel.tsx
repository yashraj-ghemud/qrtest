'use client';

/**
 * CustomizationPanel — colors, ECC, size, logo, templates.
 * All controls are real form elements (keyboard accessible, ARIA-labeled).
 */
import { useRef } from 'react';
import {
  type QRCustomization,
  type QRStyleTemplate,
  type ErrorCorrectionLevel,
} from '@/lib/qr/render';
import { Upload, X, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CustomizationPanelProps {
  value: QRCustomization;
  onChange: (next: QRCustomization) => void;
  onAIDesign?: () => void;
  aiLoading?: boolean;
}

const TEMPLATES: { id: QRStyleTemplate; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'dots', label: 'Dots' },
  { id: 'gradient', label: 'Gradient' },
];

const ECC_LEVELS: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

const PRESET_SWATCHES = [
  { fg: '#0f172a', bg: '#ffffff', name: 'Ink' },
  { fg: '#7c3aed', bg: '#ffffff', name: 'Violet' },
  { fg: '#06b6d4', bg: '#0a0e1a', name: 'Cyan Night' },
  { fg: '#f59e0b', bg: '#0a0e1a', name: 'Amber Dark' },
  { fg: '#10b981', bg: '#0a0e1a', name: 'Emerald Dark' },
  { fg: '#ef4444', bg: '#ffffff', name: 'Crimson' },
];

export function CustomizationPanel({
  value,
  onChange,
  onAIDesign,
  aiLoading,
}: CustomizationPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showGradient, setShowGradient] = useState(value.template === 'gradient');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, logoDataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    onChange({ ...value, logoDataUrl: null });
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* AI Design */}
      {onAIDesign && (
        <button
          onClick={onAIDesign}
          disabled={aiLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-400"
        >
          {aiLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {aiLoading ? 'Designing…' : 'AI Smart Design'}
        </button>
      )}

      {/* Template */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Style Template
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onChange({ ...value, template: t.id });
                setShowGradient(t.id === 'gradient');
              }}
              className={`rounded-md border px-2 py-1.5 text-xs font-medium transition ${
                value.template === t.id
                  ? 'border-cyan-400 bg-cyan-500/15 text-white'
                  : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600'
              }`}
              aria-pressed={value.template === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gradient colors (only when gradient template) */}
      {showGradient && (
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Gradient Start"
            value={value.gradientFrom || '#7c3aed'}
            onChange={(v) => onChange({ ...value, gradientFrom: v })}
          />
          <ColorField
            label="Gradient End"
            value={value.gradientTo || '#06b6d4'}
            onChange={(v) => onChange({ ...value, gradientTo: v })}
          />
        </div>
      )}

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label="Foreground"
          value={value.foreground}
          onChange={(v) => onChange({ ...value, foreground: v })}
        />
        <ColorField
          label="Background"
          value={value.background}
          onChange={(v) => onChange({ ...value, background: v })}
        />
      </div>

      {/* Swatches */}
      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Presets
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SWATCHES.map((s) => (
            <button
              key={s.name}
              onClick={() =>
                onChange({ ...value, foreground: s.fg, background: s.bg })
              }
              className="h-7 w-7 rounded-md border border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              style={{ background: s.bg, boxShadow: `inset 0 0 0 2px ${s.fg}` }}
              aria-label={`Preset: ${s.name}`}
              title={s.name}
            />
          ))}
        </div>
      </div>

      {/* Error Correction */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Error Correction
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {ECC_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onChange({ ...value, errorCorrection: lvl })}
              className={`rounded-md border px-2 py-1.5 text-xs font-semibold transition ${
                value.errorCorrection === lvl
                  ? 'border-cyan-400 bg-cyan-500/15 text-white'
                  : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600'
              }`}
              aria-pressed={value.errorCorrection === lvl}
              title={
                {
                  L: 'Low · 7% recovery',
                  M: 'Medium · 15% recovery',
                  Q: 'Quartile · 25% recovery',
                  H: 'High · 30% recovery (recommended with logo)',
                }[lvl]
              }
            >
              {lvl}
            </button>
          ))}
        </div>
        {value.logoDataUrl && value.errorCorrection !== 'H' && (
          <p className="mt-1.5 text-[11px] text-amber-400">
            Tip: Use error correction <strong>H</strong> when a logo is embedded for reliable scanning.
          </p>
        )}
      </div>

      {/* Size */}
      <div>
        <label
          className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400"
          htmlFor="qr-size"
        >
          <span>Export Size</span>
          <span className="text-slate-300">{value.size}px</span>
        </label>
        <input
          id="qr-size"
          type="range"
          min={128}
          max={2048}
          step={64}
          value={value.size}
          onChange={(e) => onChange({ ...value, size: Number(e.target.value) })}
          className="w-full accent-cyan-400"
          aria-valuemin={128}
          aria-valuemax={2048}
          aria-valuenow={value.size}
        />
      </div>

      {/* Logo */}
      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Center Logo (optional)
        </div>
        {value.logoDataUrl ? (
          <div className="flex items-center gap-3">
            <img
              src={value.logoDataUrl}
              alt="Logo preview"
              className="h-12 w-12 rounded-md border border-slate-700 bg-white object-contain p-1"
            />
            <button
              onClick={removeLogo}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        ) : (
          <>
            <input
              ref={logoInputRef}
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="sr-only"
            />
            <label
              htmlFor="logo-upload"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-600 px-3 py-2.5 text-xs text-slate-400 hover:border-cyan-400 hover:text-slate-200"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Logo (PNG/JPG/SVG, max 2 MB)
            </label>
          </>
        )}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
        htmlFor={`color-${label}`}
      >
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
        <input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs text-white focus:outline-none"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}
