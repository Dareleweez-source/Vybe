import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "Cloud SQL" });
  });

  // Gemini AI Caption Generator
  app.post("/api/ai/generate-caption", async (req, res) => {
    try {
      const { prompt, tone } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        // Fallback rich AI generator if API key is not yet configured in env
        const topics = prompt ? prompt.trim() : "social post";
        const hashtags = `#cascade #${topics.replace(/\s+/g, '')} #viral #trending`;
        const sampleCaptions = [
          `✨ ${topics} — Living for moments like this! What do you think? ${hashtags}`,
          `🚀 Diving deep into ${topics} today. Big things coming soon! ${hashtags}`,
          `🔥 Quick update on ${topics}: Absolutely loving how this turned out! ${hashtags}`
        ];
        const caption = sampleCaptions[Math.floor(Math.random() * sampleCaptions.length)];
        return res.json({ caption });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Write an engaging, trendy social media post caption with 3-4 hashtags based on this topic/draft: "${prompt || 'daily update'}". Tone requested: ${tone || 'engaging'}. Return only the caption text.`,
      });

      res.json({ caption: response.text?.trim() || prompt });
    } catch (error: any) {
      console.error("AI Caption Error:", error);
      res.status(500).json({ error: "Failed to generate AI caption" });
    }
  });

  // Gemini AI Content Moderation
  app.post("/api/ai/moderate-content", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback basic keyword moderation check
        const profaneWords = ["hate", "abuse", "scam", "spam", "violence"];
        const isFlagged = profaneWords.some(w => text?.toLowerCase().includes(w));
        return res.json({
          safe: !isFlagged,
          reason: isFlagged ? "Contains restricted terms" : "Safe",
          score: isFlagged ? 0.85 : 0.05
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Analyze this social media text for severe toxicity, hate speech, or dangerous spam: "${text}". Reply with JSON only: {"safe": boolean, "reason": "short explanation"}`,
      });

      try {
        const result = JSON.parse(response.text || '{"safe": true, "reason": "Safe"}');
        res.json(result);
      } catch {
        res.json({ safe: true, reason: "Safe" });
      }
    } catch (error: any) {
      console.error("AI Moderation Error:", error);
      res.json({ safe: true, reason: "Pass" });
    }
  });

  // Auth sync endpoint
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const dbUser = await getOrCreateUser(
        req.user.uid,
        req.user.email || "",
        req.user.name,
        req.user.picture
      );
      res.json({ user: dbUser });
    } catch (error: any) {
      console.error("Error syncing user:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
