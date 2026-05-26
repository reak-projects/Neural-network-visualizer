import { PresetNetwork } from "./types";

export const PRESET_NETWORKS: PresetNetwork[] = [
  {
    id: "transformer_attention",
    name: "Feedforward Attention Transformer",
    description: "A multi-layered machine translation and attention network containing positional embedding encoders, parallel query/key/value attention heads, and linear soft-max classifiers.",
    nodes: [
      // Layer 0: Input Positional Encoders
      { id: "e0", label: "Token Embedder 0", layer: "Input Embedding", layerIndex: 0, description: "Converts raw tokens into 512-dimensional vector projections.", x: -220, y: -90, z: -40 },
      { id: "e1", label: "Token Embedder 1", layer: "Input Embedding", layerIndex: 0, description: "Encodes adjacent multi-head tokens for context preservation.", x: -220, y: -30, z: 20 },
      { id: "e2", label: "Positional Encoder X", layer: "Input Positional", layerIndex: 0, description: "Synthesizes sinusoidal positional coordinates into temporal arrays.", x: -220, y: 30, z: -20 },
      { id: "e3", label: "Attention Gateway Z", layer: "Input Gateway", layerIndex: 0, description: "Gate-filters high frequency sequence noise.", x: -220, y: 90, z: 40 },

      // Layer 1: Query, Key, Value Projections
      { id: "q0", label: "Query Projector [Q0]", layer: "Attention Prep", layerIndex: 1, description: "Generates seeking query vectors to cross-examine database keys.", x: -100, y: -100, z: -80 },
      { id: "k0", label: "Key Projector [K0]", layer: "Attention Prep", layerIndex: 1, description: "Maps reference indicators matching target inquiries.", x: -100, y: -50, z: -20 },
      { id: "v0", label: "Value Projector [V0]", layer: "Attention Prep", layerIndex: 1, description: "Contains actual feature representations for routing decisions.", x: -100, y: 0, z: 40 },
      { id: "q1", label: "Query Projector [Q1]", layer: "Attention Prep", layerIndex: 1, description: "Auxiliary system attention seeking query vectors.", x: -100, y: 50, z: -40 },
      { id: "k1", label: "Key Projector [K1]", layer: "Attention Prep", layerIndex: 1, description: "Reference key indexes for the high-priority semantic head.", x: -100, y: 100, z: 80 },

      // Layer 2: Multi-Head Attention Filters & Bottlenecks
      { id: "ah0", label: "Attention Head Alpha", layer: "Attention Head", layerIndex: 2, description: "Resolves subject-object spatial dependencies in slow-motion.", x: 20, y: -80, z: -10 },
      { id: "ah1", label: "Attention Head Beta", layer: "Attention Head", layerIndex: 2, description: "Decodes verbal aspect and tense relations within relative clauses.", x: 20, y: -20, z: 60 },
      { id: "ah2", label: "Attention Head Gamma", layer: "Attention Head", layerIndex: 2, description: "Measures semantic distance and contextual cosine similarity.", x: 20, y: 40, z: -50 },
      { id: "bn0", label: "Layer Normalizer", layer: "Transformer Bottleneck", layerIndex: 2, description: "Rescales hidden activation parameters to preserve gradient flow.", x: 100, y: 10, z: 10 },
      { id: "bn1", label: "GeLU Activation Drop", layer: "Transformer Bottleneck", layerIndex: 2, description: "Applies non-linear Gaussian Error activation scaling.", x: 100, y: 70, z: -30 },

      // Layer 3: Output Classification Headers
      { id: "out0", label: "Softmax Vocab Target", layer: "Output Classifier", layerIndex: 3, description: "Selects the next token sequence based on maximum probability.", x: 220, y: -60, z: -20 },
      { id: "out1", label: "Sentiment Classifier", layer: "Output Sentiment", layerIndex: 3, description: "Categorizes overall sequence tone from highly positive to reactive.", x: 220, y: 0, z: 30 },
      { id: "out2", label: "Entropy Metric Node", layer: "Output Telemetry", layerIndex: 3, description: "Calculates prediction perplexity and information gain decay.", x: 220, y: 60, z: -10 },
    ],
    synapses: [
      // Connections from Inputs (e) to Encoders/Projections (q, k, v)
      { from: "e0", to: "q0", weight: 0.9 },
      { from: "e0", to: "k0", weight: 0.65 },
      { from: "e1", to: "k0", weight: 0.8 },
      { from: "e1", to: "v0", weight: 0.95 },
      { from: "e2", to: "v0", weight: 0.73 },
      { from: "e2", to: "q1", weight: 0.82 },
      { from: "e3", to: "q1", weight: 0.55 },
      { from: "e3", to: "k1", weight: 0.88 },

      // Connections from Projections to Attention Heads
      { from: "q0", to: "ah0", weight: 0.95 },
      { from: "k0", to: "ah0", weight: 0.77 },
      { from: "v0", to: "ah1", weight: 0.84 },
      { from: "q1", to: "ah1", weight: 0.91 },
      { from: "k1", to: "ah2", weight: 0.87 },
      { from: "v0", to: "ah2", weight: 0.69 },

      // Feedback/Feedforward to Normalizers
      { from: "ah0", to: "bn0", weight: 0.92 },
      { from: "ah1", to: "bn0", weight: 0.86 },
      { from: "ah2", to: "bn1", weight: 0.94 },
      { from: "bn0", to: "bn1", weight: 0.75 },

      // Normalizers to Output Classification
      { from: "bn0", to: "out0", weight: 0.83 },
      { from: "bn0", to: "out1", weight: 0.96 },
      { from: "bn1", to: "out1", weight: 0.74 },
      { from: "bn1", to: "out2", weight: 0.88 },
      { from: "out1", to: "out0", weight: 0.4 }, // lateral inhibiting syn
    ]
  },
  {
    id: "circular_recurrent",
    name: "Toroidal LSTM Feedback Loop",
    description: "An interactive recurrent structure containing double helical memory loops. Information orbits continuously, reinforcing hidden cells and gating previous memory vectors.",
    nodes: [
      // A concentric circle/torus structure
      { id: "r0", label: "Cell State Node A", layer: "Recurrent Loop", layerIndex: 1, description: "Holds the long-term cell memory vector.", x: -160, y: -100, z: -50 },
      { id: "r1", label: "Hidden Out Node B", layer: "Recurrent Loop", layerIndex: 1, description: "Modulates cellular memory updates to outer nodes.", x: -80, y: -140, z: 20 },
      { id: "r2", label: "Forget Gate Node C", layer: "Recurrent Loop", layerIndex: 1, description: "Forgets historical layers that drop of statistical relevance.", x: 50, y: -130, z: -40 },
      { id: "r3", label: "Input Gate Node D", layer: "Recurrent Loop", layerIndex: 1, description: "Registers novel electrical inputs into the torus sequence.", x: 140, y: -70, z: 50 },
      { id: "r4", label: "Tanh Modulator E", layer: "Recurrent Loop", layerIndex: 1, description: "Clamps floating activation scales between -1.0 and 1.0.", x: 170, y: 10, z: -30 },
      { id: "r5", label: "Update Vector F", layer: "Recurrent Loop", layerIndex: 1, description: "Executes element-wise matrix additions during pulses.", x: 130, y: 90, z: 40 },
      { id: "r6", label: "Sigma Activator G", layer: "Recurrent Loop", layerIndex: 1, description: "Filters state thresholds through sigmoid logistics.", x: 30, y: 140, z: -20 },
      { id: "r7", label: "Torus Bridge Node H", layer: "Recurrent Loop", layerIndex: 1, description: "Bridges state transitions back to the entry gateway.", x: -80, y: 120, z: 40 },
      { id: "r8", label: "Oscillator Node I", layer: "Recurrent Loop", layerIndex: 1, description: "Instigates natural waves and pulsing rhythmic rhythms.", x: -150, y: 50, z: -40 },
      
      // Interface drivers
      { id: "rin0", label: "Sensory Driver Alpha", layer: "Driver Input", layerIndex: 0, description: "Feeds external clock cycles onto the recurrence tracker.", x: -240, y: -40, z: 0 },
      { id: "rin1", label: "Sensory Driver Beta", layer: "Driver Input", layerIndex: 0, description: "Drives telemetry patterns directly into memory cells.", x: -240, y: 40, z: 10 },
      { id: "rout0", label: "Attuned Output Port", layer: "Exit Driver", layerIndex: 3, description: "Translates toroidal waves back to actionable client signals.", x: 240, y: -30, z: 0 },
      { id: "rout1", label: "Coherent Output State", layer: "Exit Driver", layerIndex: 3, description: "Aggregates temporal phases into an optimized decision map.", x: 240, y: 30, z: -10 }
    ],
    synapses: [
      // Circular Loop Connections
      { from: "r0", to: "r1", weight: 0.95 },
      { from: "r1", to: "r2", weight: 0.95 },
      { from: "r2", to: "r3", weight: 0.95 },
      { from: "r3", to: "r4", weight: 0.95 },
      { from: "r4", to: "r5", weight: 0.95 },
      { from: "r5", to: "r6", weight: 0.95 },
      { from: "r6", to: "r7", weight: 0.95 },
      { from: "r7", to: "r8", weight: 0.95 },
      { from: "r8", to: "r0", weight: 0.95 }, // Closes the circle!

      // Cross-cutting chord synapses for complex feedback loops
      { from: "r2", to: "r7", weight: 0.7 },
      { from: "r5", to: "r1", weight: 0.62 },
      { from: "r8", to: "r3", weight: 0.78 },
      { from: "r0", to: "r4", weight: 0.5 },

      // Inputs attaching
      { from: "rin0", to: "r0", weight: 0.9 },
      { from: "rin1", to: "r8", weight: 0.8 },
      { from: "rin0", to: "rin1", weight: 0.3 },

      // Outputs reading
      { from: "r3", to: "rout0", weight: 0.85 },
      { from: "r5", to: "rout1", weight: 0.91 },
      { from: "r4", to: "rout0", weight: 0.6 }
    ]
  },
  {
    id: "bilateral_brain",
    name: "Bilateral Neural Hemispheres",
    description: "An organic map illustrating bilateral processing. The Left Hemisphere (analytical logic/sequence) and Right Hemisphere (holistic patterns/spatial synthesis) exchange signals via a central Corpus Callosum bridge.",
    nodes: [
      // Left Hemisphere (y < 0)
      { id: "lh_in", label: "Semantic Capture Unit", layer: "Left Input", layerIndex: 0, description: "Registers discrete numerical patterns and sequential sequences.", x: -200, y: -110, z: -30 },
      { id: "lh_p0", label: "Serial Parsing Neuron", layer: "Left Processor", layerIndex: 1, description: "Extracts logical chains and chronological intervals.", x: -100, y: -130, z: -80 },
      { id: "lh_p1", label: "Boolean Gated Array", layer: "Left Processor", layerIndex: 1, description: "Applies strict inductive logic filter gates.", x: -100, y: -90, z: 40 },
      { id: "lh_p2", label: "Grammar Core Node", layer: "Left Processor", layerIndex: 2, description: "Compiles structural trees and language token chains.", x: 80, y: -100, z: -20 },
      { id: "lh_p3", label: "Axiomatic Engine Alpha", layer: "Left Processor", layerIndex: 2, description: "Deduces analytical proofs and deterministic decisions.", x: 80, y: -140, z: 60 },
      { id: "lh_out", label: "Left Executive Director", layer: "Left Output", layerIndex: 3, description: "Drives deliberate mechanical vectors and verbal triggers.", x: 200, y: -110, z: -10 },

      // Corpus Callosum (y ~ 0, bridge)
      { id: "cc0", label: "Chiasm Synaptic Bridge X", layer: "Corpus Callosum", layerIndex: 1, description: "Interhemispheric pathway exchanging language data.", x: -20, y: -10, z: -10 },
      { id: "cc1", label: "Chiasm Synaptic Bridge Y", layer: "Corpus Callosum", layerIndex: 2, description: "Synchronizes hemispheric clocks and wave phases.", x: 20, y: 10, z: 10 },

      // Right Hemisphere (y > 0)
      { id: "rh_in", label: "Aesthetic Spatial Capture", layer: "Right Input", layerIndex: 0, description: "Captures parallel optical textures, frequencies, and forms.", x: -200, y: 110, z: 30 },
      { id: "rh_p0", label: "Parallel Pitch Decolator", layer: "Right Processor", layerIndex: 1, description: "Decrypts audio harmonics and acoustic structures.", x: -100, y: 90, z: -40 },
      { id: "rh_p1", label: "Spatial Gestalt Synthesizer", layer: "Right Processor", layerIndex: 1, description: "Integrates fractured angles into unified 3D models.", x: -100, y: 130, z: 80 },
      { id: "rh_p2", label: "Metaphor Associator", layer: "Right Processor", layerIndex: 2, description: "Maps indirect conceptual links across extreme nodes.", x: 80, y: 140, z: -60 },
      { id: "rh_p3", label: "Intuitive Leap Engine", layer: "Right Processor", layerIndex: 2, description: "Generates heuristic guesses using global pattern clusters.", x: 80, y: 100, z: 30 },
      { id: "rh_out", label: "Right Executive Director", layer: "Right Output", layerIndex: 3, description: "Commands emotional tones and intuitive physical loops.", x: 200, y: 110, z: 10 }
    ],
    synapses: [
      // Left H Intra-connections
      { from: "lh_in", to: "lh_p0", weight: 0.85 },
      { from: "lh_in", to: "lh_p1", weight: 0.72 },
      { from: "lh_p0", to: "lh_p2", weight: 0.9 },
      { from: "lh_p1", to: "lh_p2", weight: 0.82 },
      { from: "lh_p1", to: "lh_p3", weight: 0.79 },
      { from: "lh_p2", to: "lh_out", weight: 0.92 },
      { from: "lh_p3", to: "lh_out", weight: 0.88 },

      // Right H Intra-connections
      { from: "rh_in", to: "rh_p0", weight: 0.78 },
      { from: "rh_in", to: "rh_p1", weight: 0.89 },
      { from: "rh_p0", to: "rh_p2", weight: 0.84 },
      { from: "rh_p1", to: "rh_p2", weight: 0.65 },
      { from: "rh_p1", to: "rh_p3", weight: 0.93 },
      { from: "rh_p2", to: "rh_out", weight: 0.87 },
      { from: "rh_p3", to: "rh_out", weight: 0.91 },

      // Corpus Callosum Bridge Connections
      { from: "lh_p0", to: "cc0", weight: 0.85 },
      { from: "rh_p0", to: "cc0", weight: 0.8 },
      { from: "cc0", to: "lh_p2", weight: 0.75 },
      { from: "cc0", to: "rh_p2", weight: 0.78 },

      { from: "lh_p1", to: "cc1", weight: 0.72 },
      { from: "rh_p1", to: "cc1", weight: 0.88 },
      { from: "cc1", to: "lh_p3", weight: 0.8 },
      { from: "cc1", to: "rh_p3", weight: 0.83 },

      // Outer lateral connection between hemispheres
      { from: "lh_out", to: "rh_out", weight: 0.45 },
      { from: "rh_out", to: "lh_out", weight: 0.45 }
    ]
  },
  {
    id: "liquid_state_reservoir",
    name: "Chaotic Liquid State Reservoir",
    description: "An high-dimensional echo state machine that doesn't feed forward, but sloshes inputs around a chaotic, non-linear cloud of randomized connections before reading state vectors.",
    nodes: [
      // Chaotic scatter of reservoir nodes (mostly clustered around z~0, x~0)
      { id: "l_in", label: "Acoustic Signal Port", layer: "Direct Driver", layerIndex: 0, description: "Feeds high frequency auditory telemetry into the fluid map.", x: -230, y: 0, z: 0 },
      
      { id: "l0", label: "Reservoir Core Element A", layer: "Reservoir Cell", layerIndex: 1, description: "A high-dimensional node reacting chaotically.", x: -120, y: -70, z: -100 },
      { id: "l1", label: "Reservoir Core Element B", layer: "Reservoir Cell", layerIndex: 1, description: "Maps adjacent resonance vibrations.", x: -120, y: 60, z: 80 },
      { id: "l2", label: "Reservoir Core Element C", layer: "Reservoir Cell", layerIndex: 1, description: "Translates random amplitude frequencies.", x: -50, y: -110, z: 30 },
      { id: "l3", label: "Reservoir Core Element D", layer: "Reservoir Cell", layerIndex: 1, description: "Gathers spatial acoustic reverberations.", x: -40, y: 110, z: -60 },
      { id: "l4", label: "Reservoir Core Element E", layer: "Reservoir Cell", layerIndex: 2, description: "Applies heavy non-linear echo scaling.", x: 30, y: -40, z: 120 },
      { id: "l5", label: "Reservoir Core Element F", layer: "Reservoir Cell", layerIndex: 2, description: "Regulates feedback phase cancellations.", x: 20, y: 70, z: -110 },
      { id: "l6", label: "Reservoir Core Element G", layer: "Reservoir Cell", layerIndex: 2, description: "Saves transient state snapshots.", x: 100, y: -100, z: -40 },
      { id: "l7", label: "Reservoir Core Element H", layer: "Reservoir Cell", layerIndex: 2, description: "Calculates spectral energy fields.", x: 110, y: 80, z: 60 },
      
      { id: "l_out0", label: "Readout Linear Node X", layer: "Exit Gate", layerIndex: 3, description: "Compiles patterns linearly from the sloshing core.", x: 230, y: -50, z: -20 },
      { id: "l_out1", label: "Readout Linear Node Y", layer: "Exit Gate", layerIndex: 3, description: "Infers predictive trends using least-squares weights.", x: 230, y: 50, z: 20 }
    ],
    synapses: [
      // Signal input scatter
      { from: "l_in", to: "l0", weight: 0.92 },
      { from: "l_in", to: "l1", weight: 0.87 },
      { from: "l_in", to: "l2", weight: 0.71 },
      { from: "l_in", to: "l3", weight: 0.65 },

      // Randomized internal mesh connections (including feed-backs!)
      { from: "l0", to: "l2", weight: 0.8 },
      { from: "l2", to: "l4", weight: 0.74 },
      { from: "l4", to: "l1", weight: 0.88 }, // Feedback path
      { from: "l1", to: "l3", weight: 0.79 },
      { from: "l3", to: "l5", weight: 0.85 },
      { from: "l5", to: "l0", weight: 0.61 }, // Feedback path
      { from: "l2", to: "l6", weight: 0.9 },
      { from: "l3", to: "l7", weight: 0.83 },
      { from: "l4", to: "l6", weight: 0.67 },
      { from: "l5", to: "l7", weight: 0.75 },
      
      // Mutual connections among cores
      { from: "l6", to: "l7", weight: 0.52 },
      { from: "l7", to: "l6", weight: 0.49 }, // bidirectional

      // Feedouts to linear readouts
      { from: "l6", to: "l_out0", weight: 0.94 },
      { from: "l4", to: "l_out0", weight: 0.7 },
      { from: "l7", to: "l_out1", weight: 0.91 },
      { from: "l5", to: "l_out1", weight: 0.73 }
    ]
  }
];
