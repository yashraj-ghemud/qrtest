'use client';

/**
 * DynamicForm — renders form fields from a CategoryDef, fully data-driven.
 * No more 16-branch if/else. The form is generated from the category definition.
 */
import { useEffect, useState } from 'react';
import {
  type CategoryDef,
  type CategoryField,
} from '@/lib/qr/categories';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';

interface DynamicFormProps {
  category: CategoryDef;
  values: Record<string, string | boolean>;
  onChange: (next: Record<string, string | boolean>) => void;
  error?: string | null;
}

export function DynamicForm({ category, values, onChange, error }: DynamicFormProps) {
  // When category changes, initialize values for new fields
  useEffect(() => {
    const next: Record<string, string | boolean> = { ...values };
    let changed = false;
    for (const f of category.fields) {
      if (!(f.id in next)) {
        next[f.id] = f.kind === 'checkbox' ? false : '';
        changed = true;
      }
    }
    if (changed) onChange(next);
  }, [category.id]);

  const update = (id: string, v: string | boolean) => {
    onChange({ ...values, [id]: v });
  };

  return (
    <div className="space-y-4">
      {category.fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={(v) => update(field.id, v)}
        />
      ))}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {error}
        </div>
      )}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: CategoryField;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}) {
  const labelEl = (
    <label
      htmlFor={`f-${field.id}`}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
    >
      {field.label}
      {field.required && <span className="ml-1 text-cyan-400">*</span>}
    </label>
  );

  const helperEl = field.helper ? (
    <p className="mt-1 text-[11px] text-slate-500">{field.helper}</p>
  ) : null;

  if (field.kind === 'checkbox') {
    return (
      <label
        htmlFor={`f-${field.id}`}
        className="flex cursor-pointer items-center gap-2.5"
      >
        <input
          id={`f-${field.id}`}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-cyan-400"
        />
        <span className="text-sm text-slate-200">{field.label}</span>
      </label>
    );
  }

  if (field.kind === 'select') {
    return (
      <div>
        {labelEl}
        <select
          id={`f-${field.id}`}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {helperEl}
      </div>
    );
  }

  if (field.kind === 'textarea') {
    return (
      <div>
        {labelEl}
        <textarea
          id={`f-${field.id}`}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        {helperEl}
      </div>
    );
  }

  // File / image upload — uses our local /api/upload instead of tmpfiles.org
  if (field.kind === 'file' || field.kind === 'image') {
    return (
      <FileUploadField
        field={field}
        labelEl={labelEl}
        value={String(value || '')}
        onChange={onChange}
      />
    );
  }

  // text / tel / email / url / number / password
  const inputType =
    field.kind === 'password'
      ? 'password'
      : field.kind === 'tel'
        ? 'tel'
        : field.kind === 'email'
          ? 'email'
          : field.kind === 'url'
            ? 'url'
            : field.kind === 'number'
              ? 'number'
              : 'text';

  return (
    <div>
      {labelEl}
      <input
        id={`f-${field.id}`}
        type={inputType}
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
      />
      {helperEl}
    </div>
  );
}

function FileUploadField({
  field,
  labelEl,
  value,
  onChange,
}: {
  field: CategoryField;
  labelEl: React.ReactNode;
  value: string;
  onChange: (v: string | boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(Boolean(value));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      // For image fields, fill the imageUrl field with the uploaded URL
      // For file fields, fill the fileUrl field
      const targetId = field.kind === 'image' ? 'imageUrl' : 'fileUrl';
      onChange(data.url); // value of fileUrl/imageUrl — caller (DynamicForm) routes by id
      // Also notify that targetId should be updated — but our schema is one field at a time
      // The parent form handles the cross-field update via the field id
      setUploaded(true);
      // Trigger change on the sibling URL field via a custom event
      window.dispatchEvent(
        new CustomEvent('qrcraft:autofill', {
          detail: { fieldId: targetId, value: data.url },
        }),
      );
    } catch (err) {
      alert(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {labelEl}
      <div className="rounded-lg border border-dashed border-slate-600 p-3">
        <input
          id={`f-${field.id}`}
          type="file"
          accept={field.accept}
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <label
          htmlFor={`f-${field.id}`}
          className="flex cursor-pointer items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-200"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : uploaded ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading
            ? 'Uploading…'
            : uploaded
              ? 'Uploaded · click to replace'
              : 'Click to upload (max 20 MB)'}
        </label>
        {value && (
          <div className="mt-2 truncate text-[11px] text-slate-500">{value}</div>
        )}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        Files are stored on this server — never sent to third-party services.
      </p>
    </div>
  );
}
