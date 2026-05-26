// Types for the abstract neural network simulation

export interface NeuralNode {
  id: string;
  label: string;
  layer: string;
  layerIndex: number;
  description: string;
  x: number; // 3D coordinates
  y: number;
  z: number;
  
  // Real-time animation states
  activation: number; // 0 to 1 intensity
  lastActivated: number; // local time triggered
  pulseSize: number; // expanding radial wave progress [0 to 1]
}

export interface NeuralSynapse {
  from: string;
  to: string;
  weight: number;
}

export interface ActivePulse {
  id: string;
  from: string;
  to: string;
  progress: number; // 0 to 1 along the line path
  speed: number;
  intensity: number;
}

export interface PresetNetwork {
  id: string;
  name: string;
  description: string;
  nodes: {
    id: string;
    label: string;
    layer: string;
    layerIndex: number;
    description: string;
    x: number;
    y: number;
    z: number;
  }[];
  synapses: {
    from: string;
    to: string;
    weight: number;
  }[];
}
