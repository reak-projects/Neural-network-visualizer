import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error(
          "GEMINI_API_KEY environment variable is required to generate custom networks. Please configure it in your Secrets panel under Settings."
        );
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API Route for Neural architecture generation
  app.post("/api/generate-network", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
        return res
          .status(400)
          .json({ error: "Please provide a valid conceptual prompt." });
      }

      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a custom, professional, layered 3D neural network graph structure matching this theme: "${prompt}". Ensure it includes 15 to 45 nodes and a rich, connected grid of synapses. No markdown block wrappers inside response.text.`,
        config: {
          systemInstruction: `You are a professional machine learning architect. Generate a highly detailed custom 3D neural network representing the core processing architecture of: "${prompt}".
Keep coordinates x, y, and z beautifully aligned where layers progress along the x-axis (e.g. inputs have low negative x, hidden layers are near zero, outputs have high positive x), but add micro-deviations so it looks organic, tech-forward, and fascinating. Ensure synapses connect actual mapped nodes by matching their string IDs exactly. Minimum 15 nodes, maximum 45 nodes; 20-50 synapses.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    layer: { type: Type.STRING },
                    layerIndex: { type: Type.INTEGER },
                    description: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    z: { type: Type.NUMBER },
                  },
                  required: [
                    "id",
                    "label",
                    "layer",
                    "layerIndex",
                    "description",
                    "x",
                    "y",
                    "z",
                  ],
                },
              },
              synapses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    from: { type: Type.STRING },
                    to: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                  },
                  required: ["from", "to", "weight"],
                },
              },
            },
            required: ["nodes", "synapses"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (e: any) {
      console.error(e);
      res
        .status(500)
        .json({ error: e.message || "Failed to structure neural hierarchy." });
    }
  });

  // Check if API keys are configured (to report status silently to client)
  app.get("/api/config-status", (req, res) => {
    res.json({
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Service Vite client and index serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched and listening on port ${PORT}`);
  });
}

startServer();
