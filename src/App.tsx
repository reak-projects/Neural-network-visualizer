import React, { useState, useEffect } from "react";
import { NeuralNode, NeuralSynapse, PresetNetwork } from "./types";
import { PRESET_NETWORKS } from "./presetNetworks";
import NetworkCanvas from "./components/NetworkCanvas";
import SidebarParameters from "./components/SidebarParameters";
import {
  BrainCircuit,
  Settings,
  HelpCircle,
  TrendingUp,
  Cpu,
  Zap,
  CheckCircle,
  Eye,
  Info
} from "lucide-react";

export default function App() {
  // Active Simulated Topology state
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [synapses, setSynapses] = useState<NeuralSynapse[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>("transformer_attention");
  
  // High-level config states
  const [selectedNode, setSelectedNode] = useState<NeuralNode | null>(null);
  const [timeScale, setTimeScale] = useState<number>(0.25); // Relativistic slow motion
  const [glowIntensity, setGlowIntensity] = useState<number>(1.2);
  const [connectionRange, setConnectionRange] = useState<number>(1.0);
  const [density, setDensity] = useState<number>(1.0);
  const [themeColor, setThemeColor] = useState<"cyan" | "pink" | "orange" | "green" | "rainbow">("cyan");
  const [cameraMode, setCameraMode] = useState<"orbit" | "pan-drift" | "manual" | "node-focus">("orbit");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Gemini network compiler state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  
  // Realtime statistical logs
  const [stats, setStats] = useState({
    activeSignalsMap: 0,
    cumulativeFires: 0,
    customTopic: "Transformer Transformer Grid",
  });

  // Success state alert banner
  const [customBuildSuccess, setCustomBuildSuccess] = useState<string | null>(null);

  // Fetch API key status and load default network
  useEffect(() => {
    // 1. Fetch Key Config status
    fetch("/api/config-status")
      .then((res) => res.json())
      .then((data) => {
        setHasGeminiKey(!!data.hasGeminiKey);
      })
      .catch((err) => {
        console.warn("Could not check config status:", err);
      });

    // 2. Load the standard attention preset
    const defaultPreset = PRESET_NETWORKS.find((p) => p.id === "transformer_attention");
    if (defaultPreset) {
      loadPresetNetwork(defaultPreset);
    }
  }, []);

  // Sync selected node with latest state if node activations pulse
  useEffect(() => {
    if (selectedNode) {
      const updated = nodes.find((n) => n.id === selectedNode.id);
      if (updated && updated.activation !== selectedNode.activation) {
        setSelectedNode(updated);
      }
    }
  }, [nodes, selectedNode]);

  // Load preset network helper
  const loadPresetNetwork = (preset: PresetNetwork) => {
    const formattedNodes: NeuralNode[] = preset.nodes.map((n) => ({
      ...n,
      activation: 0,
      lastActivated: 0,
      pulseSize: 0,
    }));
    setNodes(formattedNodes);
    setSynapses(preset.synapses);
    setActivePresetId(preset.id);
    setSelectedNode(null);
    setStats((prev) => ({
      ...prev,
      customTopic: preset.name,
    }));
  };

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_NETWORKS.find((p) => p.id === presetId);
    if (found) {
      loadPresetNetwork(found);
    }
  };

  const handleClearSelectedNode = () => {
    setSelectedNode(null);
  };

  const handleNodeSelect = (node: NeuralNode | null) => {
    setSelectedNode(node);
  };

  // Node Fire triggers event handler
  const handleTriggerNodeFiring = (nodeId: string) => {
    setStats((prev) => ({
      ...prev,
      cumulativeFires: prev.cumulativeFires + 1,
    }));
  };

  // call server-side Gemini API pipeline
  const handleGenerateCustomNetwork = async (prompt: string): Promise<boolean> => {
    setIsGenerating(true);
    setGenerationError(null);
    setCustomBuildSuccess(null);

    try {
      const response = await fetch("/api/generate-network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      if (!data.nodes || !Array.isArray(data.nodes) || data.nodes.length === 0) {
        throw new Error("Gemini returned an invalid or empty neural configuration grid.");
      }

      // Map parsed network nodes to dynamic active states
      const mappedNodes: NeuralNode[] = data.nodes.map((node: any) => ({
        id: node.id || `n-${Math.random()}`,
        label: node.label || "Cognitive Node",
        layer: node.layer || "Processing Unit",
        layerIndex: typeof node.layerIndex === "number" ? node.layerIndex : 1,
        description: node.description || "Sub-processing neuron mapping spatial nodes.",
        x: typeof node.x === "number" ? node.x : (Math.random() - 0.5) * 350,
        y: typeof node.y === "number" ? node.y : (Math.random() - 0.5) * 250,
        z: typeof node.z === "number" ? node.z : (Math.random() - 0.5) * 250,
        activation: 0,
        lastActivated: 0,
        pulseSize: 0,
      }));

      // Establish synapses structure
      const mappedSynapses: NeuralSynapse[] = (data.synapses || []).map((syn: any) => ({
        from: syn.from,
        to: syn.to,
        weight: typeof syn.weight === "number" ? syn.weight : 0.5,
      }));

      setNodes(mappedNodes);
      setSynapses(mappedSynapses);
      setActivePresetId("custom_ai");
      setSelectedNode(null);
      setStats((prev) => ({
        ...prev,
        customTopic: prompt,
      }));

      setCustomBuildSuccess(`Successfully compiled active 3D domain matching: "${prompt}"!`);
      // Auto-dismiss success alert after 5s
      setTimeout(() => setCustomBuildSuccess(null), 5000);

      setIsGenerating(false);
      return true;
    } catch (e: any) {
      console.error(e);
      setGenerationError(e.message || "Failed to parse neural specifications.");
      setIsGenerating(false);
      return false;
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex flex-col font-sans">
      
      {/* 4K Cinematic Sparkle Banner */}
      <header className="absolute top-0 inset-x-0 h-14 z-20 flex items-center justify-between px-6 bg-slate-950/60 backdrop-blur border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl relative overflow-hidden group">
            <BrainCircuit size={20} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-slate-100 flex items-center gap-2 font-mono">
              NEUROSPHERE <span className="text-[10px] text-cyan-500/80 font-normal">v4.0_4K</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium select-none truncate max-w-[280px] sm:max-w-[400px]">
              Abstract AI neural network visualizer // Dynamic pulse telemetry
            </p>
          </div>
        </div>

        {/* Real-Time Central Telemetry Stat Indicators */}
        <div className="hidden md:flex items-center gap-6 font-mono text-[10px] bg-slate-900/40 border border-slate-900/60 rounded-xl px-4 py-1.5">
          <div className="flex flex-col">
            <span className="text-slate-500">ACTIVE NETWORK STATE</span>
            <span className="text-cyan-400 font-bold uppercase truncate max-w-[140px]">
              {stats.customTopic}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-500">TOTAL SYNAPSES</span>
            <span className="text-slate-200 font-bold">{synapses.length} Connections</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-500">SYNAPTIC FIRINGS</span>
            <span className="text-cyan-400 font-bold animate-pulse">
              {stats.cumulativeFires} pulses
            </span>
          </div>
        </div>

        {/* Subtle settings marker */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono uppercase">
            Ultra Slow-Mo
          </span>
        </div>
      </header>

      {/* Main interactive area */}
      <main className="flex-1 w-full h-full relative" id="canvas-workspace">
        <NetworkCanvas
          nodes={nodes}
          synapses={synapses}
          onNodeHover={() => {}}
          selectedNodeId={selectedNode ? selectedNode.id : null}
          onNodeSelect={handleNodeSelect}
          timeScale={timeScale}
          glowIntensity={glowIntensity}
          connectionRange={connectionRange}
          density={density}
          themeColor={themeColor}
          cameraMode={cameraMode}
          isPaused={isPaused}
          onTriggerNodeFiring={handleTriggerNodeFiring}
        />

        {/* Floating Custom Build Success Confirmation Toast */}
        {customBuildSuccess && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-emerald-950/80 border border-emerald-500 text-emerald-100 py-2.5 px-4 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in text-xs font-mono">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <span>{customBuildSuccess}</span>
          </div>
        )}

        {/* Floating System Specs indicator at page bottom */}
        {isGenerating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center">
            <div className="relative h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-indigo-500/10 border-b-indigo-400 animate-spin-reverse" />
              <Cpu size={24} className="text-cyan-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-200 mt-4 font-mono font-bold tracking-widest bg-slate-950/95 px-4 py-2 border border-slate-800 rounded-full shadow-2xl">
              COMPILING COGNITIVE ARCHITECTURE...
            </p>
          </div>
        )}

        {/* Side Panel Hub Controls overlay */}
        <SidebarParameters
          presets={PRESET_NETWORKS}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
          selectedNode={selectedNode}
          onClearSelectedNode={handleClearSelectedNode}
          timeScale={timeScale}
          onTimeScaleChange={setTimeScale}
          glowIntensity={glowIntensity}
          onGlowIntensityChange={setGlowIntensity}
          connectionRange={connectionRange}
          onConnectionRangeChange={setConnectionRange}
          density={density}
          onDensityChange={setDensity}
          themeColor={themeColor}
          onThemeColorChange={setThemeColor}
          cameraMode={cameraMode}
          onCameraModeChange={setCameraMode}
          isPaused={isPaused}
          onTogglePlay={() => setIsPaused(!isPaused)}
          onGenerateCustomNetwork={handleGenerateCustomNetwork}
          isGenerating={isGenerating}
          generationError={generationError}
          hasGeminiKey={hasGeminiKey}
        />
      </main>

      {/* Embedded Dynamic Fade Transitions custom stylesheet */}
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-back 1.5s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-back {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
