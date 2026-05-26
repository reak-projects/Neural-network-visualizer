import React, { useEffect, useRef, useState } from "react";
import { NeuralNode, NeuralSynapse, ActivePulse } from "../types";

interface NetworkCanvasProps {
  nodes: NeuralNode[];
  synapses: NeuralSynapse[];
  onNodeHover: (node: NeuralNode | null) => void;
  selectedNodeId: string | null;
  onNodeSelect: (node: NeuralNode | null) => void;
  timeScale: number; // 0.05x to 1.5x
  glowIntensity: number; // 0.5 to 2.0
  connectionRange: number; // visual brightness of synapses
  density: number; // node size scalar
  themeColor: "cyan" | "pink" | "orange" | "green" | "rainbow";
  cameraMode: "orbit" | "pan-drift" | "manual" | "node-focus";
  isPaused: boolean;
  onTriggerNodeFiring: (nodeId: string) => void;
}

// Drifting starfields in the 3D grid
interface SpaceDust {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
}

export default function NetworkCanvas({
  nodes,
  synapses,
  onNodeHover,
  selectedNodeId,
  onNodeSelect,
  timeScale,
  glowIntensity,
  connectionRange,
  density,
  themeColor,
  cameraMode,
  isPaused,
  onTriggerNodeFiring,
}: NetworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep references to values to run smooth 60fps animation without re-mounts
  const stateRef = useRef({
    nodes: [] as NeuralNode[],
    synapses: [] as NeuralSynapse[],
    pulses: [] as ActivePulse[],
    dust: [] as SpaceDust[],
    camera: {
      yaw: 0,
      pitch: 0.1,
      zoom: 1.0,
      targetYaw: 0,
      targetPitch: 0.1,
      offsetX: 0,
      offsetY: 0,
      targetOffsetX: 0,
      targetOffsetY: 0,
    },
    interaction: {
      isDragging: false,
      startX: 0,
      startY: 0,
      lastMouseX: 0,
      lastMouseY: 0,
    },
    dimensions: {
      width: 800,
      height: 600,
    },
    pulseIdCounter: 0,
    time: 0,
    hoveredNodeId: null as string | null,
    focusedNodeId: null as string | null,
    lastFrameTime: Date.now(),
  });

  // Local state for FPS ticker and quick node label tooltip
  const [fps, setFps] = useState(60);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    layer: string;
    activation: number;
  } | null>(null);

  // Color schemas configuration
  const themeSchemes = {
    cyan: {
      nodeColor: "rgba(6, 182, 212, p)", // tailwind-cyan-500
      edgeColor: "rgba(8, 145, 178, p)", // tailwind-cyan-600
      pulseColor: "rgba(103, 232, 249, p)", // tailwind-cyan-300
      accent: "#06b6d4",
    },
    pink: {
      nodeColor: "rgba(236, 72, 153, p)", // pink-500
      edgeColor: "rgba(190, 24, 74, p)", // rose-700
      pulseColor: "rgba(252, 165, 203, p)", // pink-300
      accent: "#ec4899",
    },
    orange: {
      nodeColor: "rgba(249, 115, 22, p)", // orange-500
      edgeColor: "rgba(194, 65, 12, p)", // orange-700
      pulseColor: "rgba(253, 186, 116, p)", // orange-300
      accent: "#f97316",
    },
    green: {
      nodeColor: "rgba(34, 197, 94, p)", // green-500
      edgeColor: "rgba(21, 128, 61, p)", // green-700
      pulseColor: "rgba(134, 239, 172, p)", // green-300
      accent: "#22c55e",
    },
    rainbow: {
      nodeColor: "rgba(99, 102, 241, p)",
      edgeColor: "rgba(147, 51, 234, p)",
      pulseColor: "rgba(244, 63, 94, p)",
      accent: "#3b82f6",
    },
  };

  // Sync prop changes immediately deep into the frame loop
  useEffect(() => {
    stateRef.current.nodes = nodes.map((node) => {
      const existing = stateRef.current.nodes.find((n) => n.id === node.id);
      return {
        ...node,
        // Preserve activation states and pulse expansions if updating presets
        activation: existing ? existing.activation : node.activation,
        lastActivated: existing ? existing.lastActivated : node.lastActivated,
        pulseSize: existing ? existing.pulseSize : node.pulseSize,
      };
    });
    stateRef.current.synapses = synapses;
  }, [nodes, synapses]);

  // Handle Resize using ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;

      const scale = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for high performance on 4k retina
      canvas.width = width * scale;
      canvas.height = height * scale;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      stateRef.current.dimensions = { width, height };

      // Initialize ambient space cosmic dust (neural dust) once on resize/start
      if (stateRef.current.dust.length === 0) {
        const dust: SpaceDust[] = [];
        for (let i = 0; i < 120; i++) {
          dust.push({
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 600,
            z: (Math.random() - 0.5) * 600,
            size: Math.random() * 1.5 + 0.5,
            brightness: Math.random() * 0.4 + 0.1,
          });
        }
        stateRef.current.dust = dust;
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Frame simulation and projection loop
  useEffect(() => {
    let animationId: number;
    let clockTicks = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const state = stateRef.current;
      const { width, height } = state.dimensions;
      const scale = Math.min(window.devicePixelRatio || 1, 2);

      // Measure FPS
      const now = Date.now();
      const delta = now - state.lastFrameTime;
      state.lastFrameTime = now;
      if (clockTicks % 30 === 0) {
        const measuredFps = Math.round(1000 / (delta || 1));
        setFps(measuredFps > 60 ? 60 : measuredFps);
      }
      clockTicks++;

      // Time progression using relative slow-motion time scale
      const step = isPaused ? 0 : timeScale;
      state.time += delta * 0.001 * step;

      // Ensure crisp rendering with device scaling
      ctx.restore();
      ctx.save();
      ctx.scale(scale, scale);

      // 1. Draw Space background - we use a translucent fill to create beautiful slow-mo glow trails
      ctx.fillStyle = "rgba(4, 5, 11, 0.12)"; // pitch black translucent
      ctx.fillRect(0, 0, width, height);

      // Distant Grid Lines (Aesthetic Cyberpunk Background)
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(30, 41, 59, 0.15)";
      const gridSpacing = 40;
      const wobbleX = Math.sin(state.time * 0.2) * 5;
      const wobbleY = Math.cos(state.time * 0.1) * 5;
      
      for (let x = (wobbleX % gridSpacing); x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (wobbleY % gridSpacing); y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Camera Controls & Camera Drift Calculation
      let yaw = state.camera.yaw;
      let pitch = state.camera.pitch;

      if (cameraMode === "orbit" && !isPaused && !state.interaction.isDragging) {
        // Slow sweeping pan
        state.camera.targetYaw += 0.0007 * (timeScale * 2.0);
        state.camera.targetPitch = 0.15 + Math.sin(state.time * 0.15) * 0.12;
      } else if (cameraMode === "pan-drift" && !isPaused && !state.interaction.isDragging) {
        // Linear slow pendulum sway
        state.camera.targetYaw = Math.sin(state.time * 0.1) * 0.18;
        state.camera.targetPitch = 0.1 + Math.cos(state.time * 0.08) * 0.08;
      } else if (cameraMode === "node-focus" && selectedNodeId) {
        // Lock camera focus onto selected or highly active node
        const node = state.nodes.find((n) => n.id === selectedNodeId);
        if (node) {
          // Slow orbit around the focused node
          state.camera.targetYaw = (Math.atan2(node.z, node.x) || 0) + Math.sin(state.time * 0.15) * 0.3;
          state.camera.targetPitch = 0.2 + (node.y / 400);
        }
      }

      // Smooth camera interpolation (Linear Interpolation / Lerp)
      state.camera.yaw += (state.camera.targetYaw - state.camera.yaw) * 0.04;
      state.camera.pitch += (state.camera.targetPitch - state.camera.pitch) * 0.04;

      // Project camera offsets
      state.camera.offsetX += (state.camera.targetOffsetX - state.camera.offsetX) * 0.06;
      state.camera.offsetY += (state.camera.targetOffsetY - state.camera.offsetY) * 0.06;

      const cosYaw = Math.cos(state.camera.yaw);
      const sinYaw = Math.sin(state.camera.yaw);
      const cosPitch = Math.cos(state.camera.pitch);
      const sinPitch = Math.sin(state.camera.pitch);

      // Central Coordinates
      const centerX = width / 2 + state.camera.offsetX;
      const centerY = height / 2 + state.camera.offsetY;
      const cameraDistance = 420; // Simulated orbit radius
      const fov = 380; // Perspective warp factor

      // 3. Helper projection formula mapping 3D Cartesian coordinates (x,y,z) into projected 2D coordinates
      const project = (x3d: number, y3d: number, z3d: number) => {
        // Rotate along Yaw (Y-axis)
        const xRot = x3d * cosYaw - z3d * sinYaw;
        const zRot = x3d * sinYaw + z3d * cosYaw;

        // Rotate along Pitch (X-axis)
        const yRot = y3d * cosPitch - zRot * sinPitch;
        const zFinal = y3d * sinPitch + zRot * cosPitch;

        // Depth perspective math
        const depth = cameraDistance + zFinal;
        if (depth <= 10) return { x: centerX, y: centerY, scale: 0, visible: false, depth: zFinal };

        const projectedScale = fov / depth;
        return {
          x: centerX + xRot * projectedScale,
          y: centerY + yRot * projectedScale,
          scale: projectedScale,
          visible: true,
          depth: zFinal, // Negative means closer, positive means farther
        };
      };

      // 4. Draw distant ambient neural dust (Cosmic space dust)
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      state.dust.forEach((d) => {
        // Dust slowly drifts in Z axis
        if (!isPaused) {
          d.z -= 0.15 * timeScale;
          if (d.z < -300) d.z = 300;
        }

        const proj = project(d.x, d.y, d.z);
        if (proj.visible) {
          const alphaColor = d.brightness * (1 - (proj.depth + 300) / 600);
          ctx.fillStyle = `rgba(186, 230, 253, ${Math.max(0, alphaColor * 0.6)})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, d.size * proj.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Map color scheme
      const scheme = themeSchemes[themeColor];

      // 5. Update and decay Node activation states (decay back to baseline)
      state.nodes.forEach((node) => {
        if (!isPaused) {
          // Slow progressive activation decay
          if (node.activation > 0.0) {
            // Decay faster if it's highly activated and slow motion is running
            node.activation -= 0.015 * timeScale;
            if (node.activation < 0.0) node.activation = 0;
          }

          // Expand radial wave pulse
          if (node.activation > 0.3) {
            node.pulseSize += 0.02 * timeScale;
            if (node.pulseSize > 1.0) node.pulseSize = 0;
          }
        }
      });

      // 6. DRAW SYNAPSES (Connections/Edges) with Depth Sorting
      // Sort synapses purely based on the middle depth of from/to nodes for beautiful transparency overlapping!
      interface SynapseProjected {
        synapse: NeuralSynapse;
        pFrom: any;
        pTo: any;
        avgDepth: number;
      }

      const projectedSynapses: SynapseProjected[] = [];

      state.synapses.forEach((syn) => {
        const fromNode = state.nodes.find((n) => n.id === syn.from);
        const toNode = state.nodes.find((n) => n.id === syn.to);

        if (fromNode && toNode) {
          const pFrom = project(fromNode.x, fromNode.y, fromNode.z);
          const pTo = project(toNode.x, toNode.y, toNode.z);

          if (pFrom.visible && pTo.visible) {
            projectedSynapses.push({
              synapse: syn,
              pFrom,
              pTo,
              avgDepth: (pFrom.depth + pTo.depth) / 2,
            });
          }
        }
      });

      // Sort: Farther synapses (higher avgDepth) rendered first so close items overlapping look real in 3D
      projectedSynapses.sort((a, b) => b.avgDepth - a.avgDepth);

      projectedSynapses.forEach(({ synapse, pFrom, pTo, avgDepth }) => {
        const fromNode = state.nodes.find((n) => n.id === synapse.from);
        const toNode = state.nodes.find((n) => n.id === synapse.to);
        if (!fromNode || !toNode) return;

        // Connection brightness relies on: weight, node activations, scale
        const activity = (fromNode.activation + toNode.activation) / 2;
        const widthModifier = (1 + activity * 3) * ((pFrom.scale + pTo.scale) / 2) * 0.25;

        // Edge opacity: scales down as depth gets deeper (farther items are faint)
        const depthOpacity = Math.max(0.04, 1 - (avgDepth + 150) / 450);
        const pulseGlow = activity * 0.5 * glowIntensity;
        const finalAlpha = (0.08 + pulseGlow + synapse.weight * 0.15) * depthOpacity * connectionRange;

        ctx.beginPath();
        ctx.moveTo(pFrom.x, pFrom.y);
        ctx.lineTo(pTo.x, pTo.y);

        // Rainbow mode gradient, otherwise flat theme
        if (themeColor === "rainbow") {
          const grad = ctx.createLinearGradient(pFrom.x, pFrom.y, pTo.x, pTo.y);
          grad.addColorStop(0, `hsla(${(now / 30) % 360}, 80%, 65%, ${finalAlpha})`);
          grad.addColorStop(1, `hsla(${((now / 30) + 120) % 360}, 80%, 65%, ${finalAlpha})`);
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = scheme.edgeColor.replace("p", finalAlpha.toFixed(3));
        }

        ctx.lineWidth = Math.max(0.5, widthModifier);
        ctx.stroke();

        // If fromNode is highly activated, slowly fire occasional natural electric pulses down the synapse
        // Only if not paused, and pulse generator is active
        if (
          !isPaused &&
          fromNode.activation > 0.8 &&
          Math.random() < 0.003 * timeScale &&
          state.pulses.length < 50
        ) {
          state.pulses.push({
            id: `p-${state.pulseIdCounter++}`,
            from: synapse.from,
            to: synapse.to,
            progress: 0,
            speed: (0.012 + Math.random() * 0.008) * (synapse.weight * 1.5),
            intensity: fromNode.activation * synapse.weight,
          });
        }
      });

      // 7. UPDATE & DRAW ELECTRIC PULSES
      if (!isPaused) {
        state.pulses.forEach((pulse) => {
          pulse.progress += pulse.speed * timeScale;
        });

        // Trigger node activation on pulse arrival
        const completedPulses = state.pulses.filter((p) => p.progress >= 1.0);
        completedPulses.forEach((pulse) => {
          const target = state.nodes.find((n) => n.id === pulse.to);
          if (target) {
            target.activation = 1.0;
            target.pulseSize = 0;
            target.lastActivated = now;

            // Instantly echo onTriggerNodeFiring back to the React app for sound, trigger stats, or details
            onTriggerNodeFiring(target.id);

            // Progressive cascade path activation: Fire child signals from here!
            // Fire 1 to 3 outbound synapses matching connection targets
            const outSynapses = stateRef.current.synapses.filter((s) => s.from === target.id);
            const count = Math.min(outSynapses.length, Math.random() < 0.3 ? 2 : 1);
            
            // Randomly shuffle outbound targets to select 1 or 2
            const shuffled = [...outSynapses].sort(() => Math.random() - 0.5).slice(0, count);
            shuffled.forEach((syn) => {
              stateRef.current.pulses.push({
                id: `p-${stateRef.current.pulseIdCounter++}`,
                from: syn.from,
                to: syn.to,
                progress: 0,
                speed: (0.01 + Math.random() * 0.01) * (syn.weight * 1.4),
                intensity: 1.0,
              });
            });
          }
        });

        // Retain only active pulses
        state.pulses = state.pulses.filter((p) => p.progress < 1.0);
      }

      // Render Active Pulses with Z-Depth projection sorting
      state.pulses.forEach((pulse) => {
        const fromNode = state.nodes.find((n) => n.id === pulse.from);
        const toNode = state.nodes.find((n) => n.id === pulse.to);

        if (fromNode && toNode) {
          const pFrom = project(fromNode.x, fromNode.y, fromNode.z);
          const pTo = project(toNode.x, toNode.y, toNode.z);

          if (pFrom.visible && pTo.visible) {
            // Pulse position along linear path
            const px = pFrom.x + (pTo.x - pFrom.x) * pulse.progress;
            const py = pFrom.y + (pTo.y - pFrom.y) * pulse.progress;
            const pScale = pFrom.scale + (pTo.scale - pFrom.scale) * pulse.progress;
            const pDepth = (pFrom.depth + pTo.depth) / 2;

            const depthOpacity = Math.max(0.1, 1 - (pDepth + 150) / 450);
            const pulseSizeFactor = 2.4 * pScale * 0.25;

            // Render a glowing light orb
            ctx.beginPath();
            ctx.arc(px, py, pulseSizeFactor * (1.2 + pulse.intensity * 0.5), 0, Math.PI * 2);

            if (themeColor === "rainbow") {
              ctx.fillStyle = `hsla(${(now / 3 + pDepth) % 360}, 100%, 75%, ${depthOpacity})`;
            } else {
              ctx.fillStyle = scheme.pulseColor.replace("p", depthOpacity.toFixed(3));
            }
            ctx.fill();

            // Render an inner hot electric white core
            ctx.beginPath();
            ctx.arc(px, py, pulseSizeFactor * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            // Tiny light spark trail mapping: previous positions
            const steps = 4;
            for (let i = 1; i <= steps; i++) {
              const trailProgress = Math.max(0, pulse.progress - i * 0.03);
              const tx = pFrom.x + (pTo.x - pFrom.x) * trailProgress;
              const ty = pFrom.y + (pTo.y - pFrom.y) * trailProgress;
              const tOpacity = Math.max(0, (depthOpacity - i * 0.18) * 0.5);

              ctx.beginPath();
              ctx.arc(tx, ty, pulseSizeFactor * (1.0 - i * 0.15), 0, Math.PI * 2);
              ctx.fillStyle = themeColor === "rainbow" 
                ? `hsla(${(now / 3 + pDepth + i * 15) % 360}, 80%, 60%, ${tOpacity})`
                : scheme.pulseColor.replace("p", tOpacity.toFixed(3));
              ctx.fill();
            }
          }
        }
      });

      // 8. RENDER NODES with Depth Sorting
      // Calculate projecting parameters for all nodes first
      interface NodeProjected {
        node: NeuralNode;
        proj: any;
      }

      const projectedNodes: NodeProjected[] = [];

      state.nodes.forEach((node) => {
        const proj = project(node.x, node.y, node.z);
        if (proj.visible) {
          projectedNodes.push({ node, proj });
        }
      });

      // Depth sorting: Farther nodes drawn FIRST (closest drawn last)
      projectedNodes.sort((a, b) => b.proj.depth - a.proj.depth);

      // Perform Hover intersection target check of closest elements
      let foundHoverNode: NeuralNode | null = null;
      const screenX = state.interaction.lastMouseX;
      const screenY = state.interaction.lastMouseY;

      // Scan closest element first (at the end of sorted list, i.e., front of screen)
      for (let i = projectedNodes.length - 1; i >= 0; i--) {
        const { node, proj } = projectedNodes[i];
        const clickableRadius = Math.max(16, 6 + density * proj.scale); // buffer radius

        const dx = screenX - proj.x;
        const dy = screenY - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < clickableRadius) {
          foundHoverNode = node;
          break;
        }
      }

      if (foundHoverNode?.id !== state.hoveredNodeId) {
        state.hoveredNodeId = foundHoverNode ? foundHoverNode.id : null;
        onNodeHover(foundHoverNode);
      }

      // Draw projected nodes
      projectedNodes.forEach(({ node, proj }) => {
        const isHovered = node.id === state.hoveredNodeId;
        const isSelected = node.id === selectedNodeId;

        // Base values and depth variables
        const depthOpacity = Math.max(0.12, 1 - (proj.depth + 150) / 450);
        const nodeBaseRadius = 3.5 + (node.layerIndex === 0 || node.layerIndex === 3 ? 1.5 : 0);
        const finalRadius = nodeBaseRadius * proj.scale * 0.25 * density * (isHovered ? 1.3 : 1.0);

        // Core visual intensity based on local node trigger activation state
        const glowPhase = isPaused ? 0.3 : Math.sin(now * 0.005 + node.x) * 0.2 + 0.5;
        const activeAlpha = 0.5 + node.activation * 0.5;
        const combinedOpacity = activeAlpha * depthOpacity;

        // Visual halo bloom glow if highly activated or currently hovered
        if (node.activation > 0.1 || isHovered || isSelected) {
          const glowRadius = finalRadius * (2.2 + node.activation * 2.5) * glowIntensity;
          const radialGlowAlpha = (0.15 + node.activation * 0.45) * depthOpacity;

          const glowGrad = ctx.createRadialGradient(proj.x, proj.y, finalRadius * 0.5, proj.x, proj.y, glowRadius);
          if (themeColor === "rainbow") {
            glowGrad.addColorStop(0, `hsla(${(now / 3) % 360}, 100%, 70%, ${radialGlowAlpha})`);
            glowGrad.addColorStop(1, `hsla(${(now / 3) % 360}, 100%, 70%, 0)`);
          } else {
            glowGrad.addColorStop(0, scheme.nodeColor.replace("p", radialGlowAlpha.toFixed(3)));
            glowGrad.addColorStop(1, scheme.nodeColor.replace("p", "0"));
          }

          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Firing expanding pulse circle shell
        if (node.activation > 0.2) {
          const ringRadius = finalRadius * (1 + node.pulseSize * 3.5);
          const ringAlpha = (1.0 - node.pulseSize) * 0.4 * depthOpacity;

          ctx.strokeStyle = themeColor === "rainbow"
            ? `hsla(${(now / 2) % 360}, 90%, 75%, ${ringAlpha})`
            : scheme.pulseColor.replace("p", ringAlpha.toFixed(3));
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw node center body
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, finalRadius, 0, Math.PI * 2);

        if (isSelected) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = themeColor === "rainbow" ? "#ef4444" : scheme.accent;
          ctx.lineWidth = 2.0;
          ctx.fill();
          ctx.stroke();
        } else if (isHovered) {
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        } else {
          ctx.fillStyle = themeColor === "rainbow"
            ? `hsla(${(now / 2 + node.x) % 360}, 100%, 65%, ${combinedOpacity})`
            : scheme.nodeColor.replace("p", combinedOpacity.toFixed(3));
          ctx.fill();

          // Border outlines
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Node ID indicators (Subtle typography markings next to nodes)
        if (isHovered || isSelected || (proj.scale > 1.2 && node.activation > 0.5)) {
          ctx.font = "500 10px Inter, system-ui, sans-serif";
          ctx.fillStyle = `rgba(248, 250, 252, ${Math.min(1.0, depthOpacity * 1.5)})`;
          
          // Measure text width to align nicely
          const text = node.label;
          const textWidth = ctx.measureText(text).width;
          
          // Draw subtle backing pill
          ctx.fillStyle = "rgba(4, 5, 12, 0.75)";
          ctx.fillRect(proj.x + finalRadius + 5, proj.y - 8, textWidth + 10, 16);
          ctx.strokeStyle = isSelected ? scheme.accent : "rgba(255, 255, 255, 0.15)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(proj.x + finalRadius + 5, proj.y - 8, textWidth + 10, 16);

          ctx.fillStyle = "#f8fafc";
          ctx.fillText(text, proj.x + finalRadius + 10, proj.y + 3);
        }

        // Nodes cascade activator sequencer helper
        // If sequential test activation mode is running, occasionally pulse nodes one by one
        if (!isPaused && Math.random() < 0.0003 * timeScale && state.pulses.length === 0) {
          // Find an input or highly active processor node and pulse it
          const randomNode = state.nodes[Math.floor(Math.random() * state.nodes.length)];
          if (randomNode) {
            randomNode.activation = 1.0;
            randomNode.pulseSize = 0;
            
            // Fire pulses through outwards
            const outSyns = stateRef.current.synapses.filter((s) => s.from === randomNode.id);
            outSyns.forEach((syn) => {
              stateRef.current.pulses.push({
                id: `p-${stateRef.current.pulseIdCounter++}`,
                from: syn.from,
                to: syn.to,
                progress: 0,
                speed: (0.01 + Math.random() * 0.01) * syn.weight,
                intensity: 1.0,
              });
            });
          }
        }
      });

      // Synchronize details tooltips
      if (foundHoverNode) {
        const matchedProj = projectedNodes.find((pn) => pn.node.id === foundHoverNode!.id);
        if (matchedProj) {
          setTooltip({
            x: matchedProj.proj.x,
            y: matchedProj.proj.y,
            label: foundHoverNode.label,
            layer: foundHoverNode.layer,
            activation: foundHoverNode.activation,
          });
        }
      } else {
        setTooltip(null);
      }

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [
    nodes,
    synapses,
    timeScale,
    glowIntensity,
    connectionRange,
    density,
    themeColor,
    cameraMode,
    selectedNodeId,
    isPaused,
  ]);

  // Click handler to select nodes and activate them manually
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const cosYaw = Math.cos(state.camera.yaw);
    const sinYaw = Math.sin(state.camera.yaw);
    const cosPitch = Math.cos(state.camera.pitch);
    const sinPitch = Math.sin(state.camera.pitch);

    const centerX = state.dimensions.width / 2 + state.camera.offsetX;
    const centerY = state.dimensions.height / 2 + state.camera.offsetY;
    const cameraDistance = 420;
    const fov = 380;

    let clickedNode: NeuralNode | null = null;

    // Scan backwards (closest z first)
    const projectedNodes = state.nodes.map((node) => {
      // 3D rotations matching render math
      const xRot = node.x * cosYaw - node.z * sinYaw;
      const zRot = node.x * sinYaw + node.z * cosYaw;
      const yRot = node.y * cosPitch - zRot * sinPitch;
      const zFinal = node.y * sinPitch + zRot * cosPitch;
      const depth = cameraDistance + zFinal;

      const scaleFactor = depth > 10 ? fov / depth : 0;
      return {
        node,
        x: centerX + xRot * scaleFactor,
        y: centerY + yRot * scaleFactor,
        scale: scaleFactor,
        depth: zFinal,
      };
    });

    // Hover search closest
    projectedNodes.sort((a, b) => a.depth - b.depth);

    for (let i = projectedNodes.length - 1; i >= 0; i--) {
      const p = projectedNodes[i];
      const clickableRadius = Math.max(16, 6 + density * p.scale);

      const dx = clickX - p.x;
      const dy = clickY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < clickableRadius) {
        clickedNode = p.node;
        break;
      }
    }

    if (clickedNode) {
      // Triggers immediate manual spark node!
      clickedNode.activation = 1.0;
      clickedNode.pulseSize = 0;
      clickedNode.lastActivated = Date.now();

      // Trigger actual firing downstream outward synapses
      const outSynapses = state.synapses.filter((s) => s.from === clickedNode!.id);
      outSynapses.forEach((syn) => {
        state.pulses.push({
          id: `p-${state.pulseIdCounter++}`,
          from: syn.from,
          to: syn.to,
          progress: 0,
          speed: (0.015 + Math.random() * 0.01) * (syn.weight * 1.5),
          intensity: 1.0,
        });
      });

      onNodeSelect(clickedNode);
    } else {
      // Clear selection
      onNodeSelect(null);
    }
  };

  // Drag-and-rotate camera functions
  const handleMouseDown = (e: React.MouseEvent) => {
    stateRef.current.interaction.isDragging = true;
    stateRef.current.interaction.startX = e.clientX;
    stateRef.current.interaction.startY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    stateRef.current.interaction.lastMouseX = e.clientX - rect.left;
    stateRef.current.interaction.lastMouseY = e.clientY - rect.top;

    if (!stateRef.current.interaction.isDragging) return;

    const dx = e.clientX - stateRef.current.interaction.startX;
    const dy = e.clientY - stateRef.current.interaction.startY;

    stateRef.current.interaction.startX = e.clientX;
    stateRef.current.interaction.startY = e.clientY;

    // Apply rotation modifiers
    stateRef.current.camera.targetYaw += dx * 0.007;
    // Bind pitch so camera doesn't turn upside down
    stateRef.current.camera.targetPitch = Math.max(
      -Math.PI / 2.2,
      Math.min(Math.PI / 2.2, stateRef.current.camera.targetPitch + dy * 0.007)
    );
  };

  const handleMouseUpOrLeave = () => {
    stateRef.current.interaction.isDragging = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      id="canvas-container"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="block"
        id="neural-space-canvas"
      />

      {/* Absolute Header Overlay Status Indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 font-mono text-xs text-slate-400 pointer-events-none bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span>NEURAL ENGINE ACTIVE</span>
        <span className="text-slate-600">|</span>
        <span>FPS: {fps}</span>
        <span className="text-slate-600">|</span>
        <span>PULSES: {stateRef.current.pulses.length}</span>
      </div>

      {/* Click instructions floating on hover over empty space */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 font-mono text-[10px] text-slate-500 bg-slate-900/40 backdrop-blur px-2.5 py-1.5 rounded border border-slate-900 pointer-events-none">
          💡 Click node to fire manual pulse | Drag mouse to orbit 3D space
        </div>
      )}

      {/* Floating coordinates grid background indicator */}
      <div className="absolute right-4 top-4 z-10 font-mono text-[10px] text-sky-500/55 pointer-events-none select-none text-right flex flex-col gap-0.5">
        <div>ORBIT_RAD: 420LY</div>
        <div>CAM_YAW: {stateRef.current.camera.yaw.toFixed(2)}rad</div>
        <div>CAM_PIT: {stateRef.current.camera.pitch.toFixed(2)}rad</div>
      </div>
    </div>
  );
}
