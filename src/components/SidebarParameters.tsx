import React, { useState } from "react";
import { PresetNetwork, NeuralNode } from "../types";
import {
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Tv,
  BookOpen,
  Compass,
  AlertCircle,
  HelpCircle,
  Clock,
  X,
  Plus
} from "lucide-react";

interface SidebarParametersProps {
  presets: PresetNetwork[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  selectedNode: NeuralNode | null;
  onClearSelectedNode: () => void;
  timeScale: number;
  onTimeScaleChange: (v: number) => void;
  glowIntensity: number;
  onGlowIntensityChange: (v: number) => void;
  connectionRange: number;
  onConnectionRangeChange: (v: number) => void;
  density: number;
  onDensityChange: (v: number) => void;
  themeColor: "cyan" | "pink" | "orange" | "green" | "rainbow";
  onThemeColorChange: (color: "cyan" | "pink" | "orange" | "green" | "rainbow") => void;
  cameraMode: "orbit" | "pan-drift" | "manual" | "node-focus";
  onCameraModeChange: (mode: "orbit" | "pan-drift" | "manual" | "node-focus") => void;
  isPaused: boolean;
  onTogglePlay: () => void;
  onGenerateCustomNetwork: (prompt: string) => Promise<boolean>;
  isGenerating: boolean;
  generationError: string | null;
  hasGeminiKey: boolean;
}

export default function SidebarParameters({
  presets,
  activePresetId,
  onSelectPreset,
  selectedNode,
  onClearSelectedNode,
  timeScale,
  onTimeScaleChange,
  glowIntensity,
  onGlowIntensityChange,
  connectionRange,
  onConnectionRangeChange,
  density,
  onDensityChange,
  themeColor,
  onThemeColorChange,
  cameraMode,
  onCameraModeChange,
  isPaused,
  onTogglePlay,
  onGenerateCustomNetwork,
  isGenerating,
  generationError,
  hasGeminiKey
}: SidebarParametersProps) {
  const [promptInput, setPromptInput] = useState("");
  const [leftTab, setLeftTab] = useState<"presets" | "generate">("presets");
  const [collapsedLeft, setCollapsedLeft] = useState(false);
  const [collapsedRight, setCollapsedRight] = useState(false);

  const samplePrompts = [
    "Quantum superposition prime factorizer",
    "Holographic forest biome ecosystem",
    "Self-improving synaptic neural translator",
    "Deep-sea acoustic wave sonar processor"
  ];

  const handlePromptCardClick = (p: string) => {
    setPromptInput(p);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;
    const success = await onGenerateCustomNetwork(promptInput);
    if (success) {
      setPromptInput("");
    }
  };

  return (
    <>
      {/* LEFT SIDEBAR: Architecture Core & Neural Synthesizer */}
      <div
        className={`absolute left-4 top-16 bottom-4 z-20 w-80 flex flex-col transition-all duration-300 ${
          collapsedLeft ? "pointer-events-none w-10 overflow-hidden" : ""
        }`}
      >
        {/* Toggle tab button if collapsed */}
        {collapsedLeft ? (
          <button
            onClick={() => setCollapsedLeft(false)}
            className="pointer-events-auto h-10 w-10 flex items-center justify-center bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-sky-400 rounded-full shadow-lg cursor-pointer"
            title="Expand Architecture Core"
          >
            <Compass size={18} className="animate-spin-slow" />
          </button>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-cyan-400" />
                <h2 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
                  ARCHITECTURE CORE
                </h2>
              </div>
              <button
                onClick={() => setCollapsedLeft(true)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Inner tabs selector */}
            <div className="grid grid-cols-2 bg-slate-900 border-b border-slate-800/40">
              <button
                onClick={() => setLeftTab("presets")}
                className={`py-2 px-3 text-xs font-medium tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
                  leftTab === "presets"
                    ? "border-cyan-400 text-cyan-400 bg-slate-950/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Database size={12} />
                PRESETS
              </button>
              <button
                onClick={() => setLeftTab("generate")}
                className={`py-2 px-3 text-xs font-medium tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
                  leftTab === "generate"
                    ? "border-cyan-400 text-cyan-400 bg-slate-950/40"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles size={12} />
                AI SYNTH
              </button>
            </div>

            {/* Content Segment */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              
              {leftTab === "presets" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    Select a spatial topology model to run interactive nodes:
                  </p>
                  
                  <div className="space-y-2">
                    {presets.map((preset) => {
                      const isActive = preset.id === activePresetId;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onSelectPreset(preset.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "bg-cyan-950/30 border-cyan-500/80 shadow-[inset_0_1px_3px_rgba(6,182,212,0.15)]"
                              : "bg-slate-900/50 hover:bg-slate-900 border-slate-800/60 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold ${
                                isActive ? "text-cyan-300" : "text-slate-200"
                              }`}
                            >
                              {preset.name}
                            </span>
                            {isActive && (
                              <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {leftTab === "generate" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-400" />
                      Gemini Neural Sculptor
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Describe your dream concept (an algorithm or ecosystem) and Gemini will scaffold a unique 3D neural net topology mapping its subcomponents.
                    </p>
                  </div>

                  <form onSubmit={handleCustomSubmit} className="space-y-2">
                    <textarea
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="e.g. A visual mapping of a recursive sound wave synthesizer"
                      disabled={isGenerating}
                      className="w-full h-24 p-2.5 text-xs text-slate-100 bg-slate-900 hover:bg-slate-900/85 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:outline-none rounded-xl resize-none transition-colors"
                    />

                    {generationError && (
                      <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/50 flex gap-2 text-[10px] text-red-300 leading-relaxed font-mono">
                        <AlertCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
                        <div>{generationError}</div>
                      </div>
                    )}

                    {!hasGeminiKey && (
                      <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/40 flex gap-2 text-[9px] text-indigo-300 leading-normal font-mono">
                        <HelpCircle size={14} className="shrink-0 text-indigo-400 mt-0.5" />
                        <div>
                          GEMINI_API_KEY is not configured. Go to **Settings &gt; Secrets** of AI Studio and set up your workspace credentials for custom generation, or enjoy our 4 elegant preset Topologies!
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isGenerating || !promptInput.trim()}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-medium tracking-wide flex items-center justify-center gap-2 border transition-all ${
                        isGenerating
                          ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                          : !promptInput.trim()
                          ? "bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-cyan-650 hover:bg-cyan-600 border-cyan-650 hover:border-cyan-600 text-slate-50 hover:shadow-cyan-900/20 shadow-lg cursor-pointer transition-colors"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="h-3 w-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                          Analyzing Neural Frequencies...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} className="text-amber-300" />
                          Construct Neural Map
                        </>
                      )}
                    </button>
                  </form>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500">
                      Sample Concepts:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {samplePrompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePromptCardClick(p)}
                          className="text-left text-[10px] p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-cyan-300/80 hover:text-cyan-300 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap transition-colors"
                        >
                          + {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: Visio-Physics Slider Parameters & Active Node Inspector */}
      <div
        className={`absolute right-4 top-16 bottom-4 z-20 w-80 flex flex-col transition-all duration-300 ${
          collapsedRight ? "pointer-events-none w-10 overflow-hidden items-end" : ""
        }`}
      >
        {collapsedRight ? (
          <button
            onClick={() => setCollapsedRight(false)}
            className="pointer-events-auto h-10 w-10 flex items-center justify-center bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-full shadow-lg cursor-pointer"
            title="Expand Controls Panel"
          >
            <Sliders size={18} />
          </button>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-cyan-400" />
                <h2 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
                  SIMULATION CONTROLS
                </h2>
              </div>
              <button
                onClick={() => setCollapsedRight(true)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              
              {/* Dynamic Time Engine */}
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 space-y-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  ⏱️ Spatial Clock Rate
                </span>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={onTogglePlay}
                    className={`px-3 py-1 text-xs rounded-lg border font-mono transition-colors cursor-pointer ${
                      isPaused
                        ? "bg-emerald-950/30 border-emerald-500 text-emerald-300 hover:bg-emerald-950/50"
                        : "bg-red-950/20 border-red-800/60 text-red-300 hover:bg-red-950/40"
                    }`}
                  >
                    {isPaused ? "▶️ RUN ENGINE" : "⏸️ PAUSE CLOCK"}
                  </button>
                  <span className="text-xs text-slate-400 font-mono">
                    Rate: {isPaused ? "Paused" : `${timeScale}x`}
                  </span>
                </div>
                
                {/* Slow motion slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0.05x (Ultra Slow-Mo)</span>
                    <span>1.5x</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={timeScale}
                    onChange={(e) => onTimeScaleChange(parseFloat(e.target.value))}
                    disabled={isPaused}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 font-mono italic">
                      {timeScale <= 0.15 
                        ? "🎬 Cinematic Quantum Slow Motion" 
                        : timeScale <= 0.5 
                        ? "🌊 Fluid Relativistic Slowness" 
                        : "⚡ Standard Clock Cycle Time"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  🎨 Neural Hue Spectra
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["cyan", "pink", "orange", "green", "rainbow"] as const).map((color) => {
                    const isActive = themeColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => onThemeColorChange(color)}
                        className={`py-1 px-1 text-[9px] font-semibold rounded-lg text-center uppercase tracking-tighter border transition-all cursor-pointer ${
                          isActive
                            ? "bg-slate-900 border-cyan-400 text-cyan-300 shadow"
                            : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Camera Angle Presets */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  📹 Photographic Projection
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "orbit", name: "3D Planetary Orbit" },
                    { id: "pan-drift", name: "Ambient Sway Drift" },
                    { id: "manual", name: "Mouse Drag-Rotate" },
                    { id: "node-focus", name: "Dynamic Node Focus" }
                  ].map((cam) => {
                    const isActive = cameraMode === cam.id;
                    return (
                      <button
                        key={cam.id}
                        onClick={() => onCameraModeChange(cam.id as any)}
                        className={`text-left p-2 rounded-xl text-[10px] border transition-all cursor-pointer ${
                          isActive
                            ? "bg-cyan-950/20 border-cyan-500/60 text-cyan-300"
                            : "bg-slate-900/30 border-slate-800/50 text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
                        }`}
                      >
                        {cam.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders: Parameters */}
              <div className="space-y-3 bg-slate-900/20 p-3 rounded-xl border border-slate-900">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  🔬 Physics Coefficients
                </span>

                {/* Glow Intensity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Node Glow (Bloom)</span>
                    <span>{glowIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={glowIntensity}
                    onChange={(e) => onGlowIntensityChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Connection Line width */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Synapse Opacity</span>
                    <span>{connectionRange.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.1"
                    value={connectionRange}
                    onChange={(e) => onConnectionRangeChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Node Weight density */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Node Radius Scale</span>
                    <span>{density.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={density}
                    onChange={(e) => onDensityChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic Selected Node Inspector Card */}
              {selectedNode ? (
                <div className="p-3 bg-cyan-950/20 rounded-xl border border-cyan-500/30 space-y-2 relative">
                  <button
                    onClick={onClearSelectedNode}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 pointer-events-auto cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Cpu size={14} className="text-cyan-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-100 select-all truncate max-w-[200px]">
                      {selectedNode.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                    <div className="bg-slate-900 px-2 py-1 rounded">
                      <span className="text-slate-500 block">LAYER ID</span>
                      <span className="text-slate-300 font-semibold truncate block">
                        {selectedNode.layer}
                      </span>
                    </div>
                    <div className="bg-slate-900 px-2 py-1 rounded">
                      <span className="text-slate-500 block">DEPTH LEVEL</span>
                      <span className="text-slate-300 font-semibold block">
                        Layer #{selectedNode.layerIndex}
                      </span>
                    </div>
                    <div className="bg-slate-900 px-2 py-1 rounded">
                      <span className="text-slate-500 block">COORDINATE Space</span>
                      <span className="text-slate-300 block">
                        X:{Math.round(selectedNode.x)} Y:{Math.round(selectedNode.y)}
                      </span>
                    </div>
                    <div className="bg-slate-900 px-2 py-1 rounded">
                      <span className="text-slate-500 block">LIVE TRIGGER POTENTIAL</span>
                      <span className="text-cyan-300 font-bold block">
                        {(selectedNode.activation * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded-lg leading-relaxed select-all">
                    {selectedNode.description}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center select-none bg-slate-900/15">
                  <BookOpen size={16} className="text-slate-500 mx-auto mb-1.5 opacity-60" />
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                    Node Inspector inactive.<br />
                    Click any node in the grid to analyze structural weights and cognitive micro-tasks.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
