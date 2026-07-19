"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, GripVertical } from "lucide-react";
import { SPIN_GUIDANCE, spinQualityLabel } from "@/lib/spin";
import {
  UPLOAD_LIMITS,
  readFileAsDataUrl,
  uploadErrorMessage,
  validateImageFile,
} from "@/lib/uploads";

type SpinUploaderProps = {
  frames: string[];
  onChange: (frames: string[]) => void;
};

export function SpinUploader({ frames, onChange }: SpinUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const quality = spinQualityLabel(frames.length);

  async function readFiles(fileList: FileList | File[]) {
    setError(null);
    const files = Array.from(fileList);
    if (!files.length) return;

    files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    if (frames.length + files.length > UPLOAD_LIMITS.maxSpinFrames) {
      setError(uploadErrorMessage("too-many"));
      return;
    }

    const valid: File[] = [];
    for (const file of files) {
      const err = validateImageFile(file);
      if (err) {
        setError(`${file.name}: ${uploadErrorMessage(err)}`);
        return;
      }
      valid.push(file);
    }

    try {
      const urls = await Promise.all(valid.map(readFileAsDataUrl));
      onChange([...frames, ...urls]);
    } catch {
      setError("Could not read one of the files. Try again.");
    }
  }

  function removeAt(index: number) {
    onChange(frames.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...frames];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-1">360° photo spin</p>
        <p className="text-xs text-muted leading-relaxed">
          Upload product photos in rotation order (left → right around the tee).
          How many?{" "}
          <span className="text-ink font-medium">
            {SPIN_GUIDANCE.minimum} minimum
          </span>
          ,{" "}
          <span className="text-ink font-medium">
            {SPIN_GUIDANCE.recommended} recommended
          </span>
          ,{" "}
          <span className="text-ink font-medium">
            {SPIN_GUIDANCE.pro}–{SPIN_GUIDANCE.ideal} pro / turntable
          </span>
          . Any count works — we auto-build a smooth 360° with crossfades.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-[10px] tracking-wide uppercase">
        {[
          { n: 4, label: "Key angles" },
          { n: 8, label: "Good" },
          { n: 16, label: "Recommended" },
          { n: 24, label: "Pro" },
        ].map((tier) => (
          <div
            key={tier.n}
            className={`border px-2 py-2 text-center ${
              frames.length >= tier.n
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-muted"
            }`}
          >
            <div className="text-sm font-semibold normal-case tracking-normal text-ink">
              {tier.n}
            </div>
            {tier.label}
          </div>
        ))}
      </div>

      <div
        className={`border border-dashed px-4 py-8 text-center transition-colors ${
          dragOver ? "border-accent bg-accent-soft" : "border-line hover:border-ink/40"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void readFiles(e.dataTransfer.files);
        }}
      >
        <ImagePlus className="mx-auto mb-3 text-muted" size={22} strokeWidth={1.5} />
        <p className="text-sm">Drop spin photos here, or</p>
        <button
          type="button"
          className="mt-2 text-sm font-medium underline underline-offset-2 hover:text-accent"
          onClick={() => inputRef.current?.click()}
        >
          browse files
        </button>
        <p className="mt-2 text-[11px] text-muted">
          PNG / JPG / WebP / SVG · max 5 MB each · name in order (01, 02, 03…)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void readFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-warn" role="alert">
          {error}
        </p>
      )}

      {frames.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            <p>
              <span className="font-medium">{frames.length} frames</span>
              <span className="text-muted"> · {quality.label}</span>
            </p>
            <button
              type="button"
              className="text-muted hover:text-ink underline underline-offset-2"
              onClick={() => onChange([])}
            >
              Clear all
            </button>
          </div>
          <p className="text-xs text-muted">{quality.hint}</p>
          <ul className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {frames.map((src, i) => (
              <li
                key={`${i}-${src.slice(0, 24)}`}
                className="relative group border border-line bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Frame ${i + 1}`}
                  className="aspect-square object-cover w-full"
                />
                <span className="absolute top-1 left-1 bg-ink/70 text-chalk text-[9px] px-1">
                  {i + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    className="flex-1 bg-chalk/90 py-1 text-[10px]"
                    onClick={() => move(i, -1)}
                    aria-label="Move earlier"
                  >
                    <GripVertical size={12} className="mx-auto rotate-90" />
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-chalk/90 py-1 text-[10px] hover:text-red-600"
                    onClick={() => removeAt(i)}
                    aria-label="Remove"
                  >
                    <Trash2 size={12} className="mx-auto" />
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-chalk/90 py-1 text-[10px]"
                    onClick={() => move(i, 1)}
                    aria-label="Move later"
                  >
                    <GripVertical size={12} className="mx-auto -rotate-90" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
