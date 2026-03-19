"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

type PreviewBg = "dark" | "light" | "grid";

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS: { name: string; layers: Omit<ShadowLayer, "id">[] }[] = [
  {
    name: "Subtle",
    layers: [
      { offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: "#000000", opacity: 0.12, inset: false },
    ],
  },
  {
    name: "Medium",
    layers: [
      { offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.2, inset: false },
    ],
  },
  {
    name: "Strong",
    layers: [
      { offsetX: 0, offsetY: 10, blur: 25, spread: -5, color: "#000000", opacity: 0.35, inset: false },
    ],
  },
  {
    name: "Floating",
    layers: [
      { offsetX: 0, offsetY: 20, blur: 50, spread: -12, color: "#000000", opacity: 0.25, inset: false },
      { offsetX: 0, offsetY: 8, blur: 16, spread: -4, color: "#000000", opacity: 0.1, inset: false },
    ],
  },
  {
    name: "Inset",
    layers: [
      { offsetX: 0, offsetY: 2, blur: 8, spread: 0, color: "#000000", opacity: 0.4, inset: true },
    ],
  },
  {
    name: "Neon Glow",
    layers: [
      { offsetX: 0, offsetY: 0, blur: 20, spread: 2, color: "#6366f1", opacity: 0.6, inset: false },
      { offsetX: 0, offsetY: 0, blur: 40, spread: 4, color: "#6366f1", opacity: 0.3, inset: false },
    ],
  },
  {
    name: "Layered",
    layers: [
      { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: "#000000", opacity: 0.1, inset: false },
      { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: "#000000", opacity: 0.1, inset: false },
      { offsetX: 0, offsetY: 16, blur: 32, spread: 0, color: "#000000", opacity: 0.1, inset: false },
    ],
  },
  {
    name: "Material",
    layers: [
      { offsetX: 0, offsetY: 3, blur: 5, spread: -1, color: "#000000", opacity: 0.2, inset: false },
      { offsetX: 0, offsetY: 6, blur: 10, spread: 0, color: "#000000", opacity: 0.14, inset: false },
      { offsetX: 0, offsetY: 1, blur: 18, spread: 0, color: "#000000", opacity: 0.12, inset: false },
    ],
  },
  {
    name: "Sharp",
    layers: [
      { offsetX: 6, offsetY: 6, blur: 0, spread: 0, color: "#000000", opacity: 0.3, inset: false },
    ],
  },
  {
    name: "Dreamy",
    layers: [
      { offsetX: 0, offsetY: 0, blur: 30, spread: 8, color: "#8b5cf6", opacity: 0.2, inset: false },
      { offsetX: 0, offsetY: 0, blur: 60, spread: 16, color: "#ec4899", opacity: 0.15, inset: false },
    ],
  },
];

// ─── Tailwind matching ───────────────────────────────────────────────────────

const TAILWIND_SHADOWS: { name: string; value: string }[] = [
  { name: "shadow-sm", value: "0 1px 2px 0 rgba(0,0,0,0.05)" },
  { name: "shadow", value: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)" },
  { name: "shadow-md", value: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)" },
  { name: "shadow-lg", value: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)" },
  { name: "shadow-xl", value: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" },
  { name: "shadow-2xl", value: "0 25px 50px -12px rgba(0,0,0,0.25)" },
  { name: "shadow-inner", value: "inset 0 2px 4px 0 rgba(0,0,0,0.05)" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function layerToCSS(l: ShadowLayer): string {
  const rgba = hexToRgba(l.color, l.opacity);
  return `${l.inset ? "inset " : ""}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${rgba}`;
}

function layersToCSS(layers: ShadowLayer[]): string {
  if (layers.length === 0) return "none";
  return layers.map(layerToCSS).join(",\n    ");
}

function matchTailwind(css: string): string {
  const normalized = css.replace(/\s+/g, " ").trim();
  for (const tw of TAILWIND_SHADOWS) {
    const twNorm = tw.value.replace(/\s+/g, " ").trim();
    if (normalized === twNorm) return tw.name;
  }
  return "custom (no Tailwind equivalent)";
}

function defaultLayer(): ShadowLayer {
  return {
    id: uid(),
    offsetX: 0,
    offsetY: 4,
    blur: 12,
    spread: 0,
    color: "#000000",
    opacity: 0.25,
    inset: false,
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomLayer(): ShadowLayer {
  const colors = ["#000000", "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];
  return {
    id: uid(),
    offsetX: randomInt(-30, 30),
    offsetY: randomInt(-30, 30),
    blur: randomInt(0, 60),
    spread: randomInt(-10, 20),
    color: colors[randomInt(0, colors.length - 1)],
    opacity: Math.round(Math.random() * 60 + 10) / 100,
    inset: Math.random() > 0.8,
  };
}

// ─── Components ──────────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-16 text-gray-400 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="w-10 text-right font-mono text-xs text-gray-300">
        {value}
      </span>
    </label>
  );
}

function LayerPanel({
  layer,
  index,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
  canRemove,
}: {
  layer: ShadowLayer;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<ShadowLayer>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border border-[#2a2a2a]"
            style={{ backgroundColor: layer.color }}
          />
          <span className="text-sm font-medium text-gray-200">
            Layer {index + 1}
          </span>
          {layer.inset && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              inset
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canRemove && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onRemove();
                }
              }}
              className="p-1 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="px-3 py-3 space-y-2.5 bg-[#0f0f0f]">
          <Slider label="X" value={layer.offsetX} min={-50} max={50} onChange={(v) => onUpdate({ offsetX: v })} />
          <Slider label="Y" value={layer.offsetY} min={-50} max={50} onChange={(v) => onUpdate({ offsetY: v })} />
          <Slider label="Blur" value={layer.blur} min={0} max={100} onChange={(v) => onUpdate({ blur: v })} />
          <Slider label="Spread" value={layer.spread} min={-50} max={50} onChange={(v) => onUpdate({ spread: v })} />
          <Slider label="Opacity" value={layer.opacity} min={0} max={1} step={0.01} onChange={(v) => onUpdate({ opacity: v })} />

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Color</span>
              <input
                type="color"
                value={layer.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <span className="text-gray-400">Inset</span>
              <button
                onClick={() => onUpdate({ inset: !layer.inset })}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  layer.inset ? "bg-indigo-500" : "bg-[#2a2a2a]"
                }`}
                aria-label={`Toggle inset ${layer.inset ? "off" : "on"}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    layer.inset ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Page() {
  const [{ layers, openLayers }, setState] = useState(() => {
    const initial = defaultLayer();
    return {
      layers: [initial] as ShadowLayer[],
      openLayers: new Set([initial.id]),
    };
  });

  const setLayers = useCallback((fn: (prev: ShadowLayer[]) => ShadowLayer[]) => {
    setState((s) => ({ ...s, layers: fn(s.layers) }));
  }, []);

  const setOpenLayers = useCallback((fn: (prev: Set<string>) => Set<string>) => {
    setState((s) => ({ ...s, openLayers: fn(s.openLayers) }));
  }, []);

  const [previewBg, setPreviewBg] = useState<PreviewBg>("dark");
  const [copied, setCopied] = useState(false);

  const updateLayer = useCallback((id: string, patch: Partial<ShadowLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setOpenLayers((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const addLayer = useCallback(() => {
    setState((s) => {
      if (s.layers.length >= 5) return s;
      const nl = defaultLayer();
      return {
        layers: [...s.layers, nl],
        openLayers: new Set(s.openLayers).add(nl.id),
      };
    });
  }, []);

  const toggleOpen = useCallback((id: string) => {
    setOpenLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset: typeof PRESETS[number]) => {
    const newLayers = preset.layers.map((l) => ({ ...l, id: uid() }));
    setState({
      layers: newLayers,
      openLayers: new Set(newLayers.map((l) => l.id)),
    });
  }, []);

  const randomize = useCallback(() => {
    const count = randomInt(1, 3);
    const newLayers = Array.from({ length: count }, () => randomLayer());
    setState({
      layers: newLayers,
      openLayers: new Set(newLayers.map((l) => l.id)),
    });
  }, []);

  const cssValue = layersToCSS(layers);
  const cssOutput = `box-shadow: ${cssValue};`;
  const tailwindMatch = matchTailwind(cssValue);

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [cssOutput]);

  const previewBgClass =
    previewBg === "light"
      ? "bg-white"
      : previewBg === "grid"
        ? "bg-[#1a1a1a]"
        : "bg-[#0a0a0a]";

  const gridStyle =
    previewBg === "grid"
      ? {
          backgroundImage:
            "linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }
      : {};

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-indigo-400">Shadow</span>Lab
        </h1>
        <a
          href="https://github.com/maxilylm/su-shadowlab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel */}
        <aside className="w-full lg:w-[380px] shrink-0 border-r border-[#2a2a2a] overflow-y-auto p-4 space-y-4">
          {/* Layer controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Layers ({layers.length}/5)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={randomize}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#3a3a3a] transition-colors"
                >
                  Random
                </button>
                <button
                  onClick={addLayer}
                  disabled={layers.length >= 5}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Add Layer
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {layers.map((layer, i) => (
                <LayerPanel
                  key={layer.id}
                  layer={layer}
                  index={i}
                  isOpen={openLayers.has(layer.id)}
                  onToggle={() => toggleOpen(layer.id)}
                  onUpdate={(patch) => updateLayer(layer.id, patch)}
                  onRemove={() => removeLayer(layer.id)}
                  canRemove={layers.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Presets
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-[#141414] border border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#3a3a3a] hover:bg-[#1a1a1a] transition-colors text-left"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex-1 flex flex-col p-6 gap-6 min-h-0">
          {/* Preview bg toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider mr-2">Background</span>
            {(["dark", "light", "grid"] as PreviewBg[]).map((bg) => (
              <button
                key={bg}
                onClick={() => setPreviewBg(bg)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors capitalize ${
                  previewBg === bg
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "bg-[#141414] border-[#2a2a2a] text-gray-400 hover:text-gray-200"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>

          {/* Preview area */}
          <div
            className={`flex-1 flex items-center justify-center rounded-xl border border-[#2a2a2a] min-h-[300px] ${previewBgClass}`}
            style={gridStyle}
          >
            <div
              className="w-48 h-48 rounded-2xl transition-shadow duration-150"
              style={{
                boxShadow: cssValue,
                backgroundColor: previewBg === "light" ? "#ffffff" : "#1e1e1e",
                border: `1px solid ${previewBg === "light" ? "#e5e5e5" : "#2a2a2a"}`,
              }}
            />
          </div>

          {/* CSS Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                CSS Output
              </h2>
              <button
                onClick={copyCSS}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  copied
                    ? "bg-green-500/20 border-green-500/40 text-green-300"
                    : "bg-[#141414] border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#3a3a3a]"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {cssOutput}
            </pre>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Tailwind:</span>
              <code className="font-mono text-gray-400">{tailwindMatch}</code>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
