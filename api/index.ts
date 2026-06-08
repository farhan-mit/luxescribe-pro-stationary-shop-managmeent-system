/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Lazy-initialization of the GoogleGenAI client (Graceful startup error prevention)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "AI Assistant is currently unavailable in this demo version."
    );
  }
  if (!aiClient) {
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

// Robust fallback model chain helper to bypass 503 high demand spikes and overloaded errors gracefully
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const candidateModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of candidateModels) {
    const retries = 2; // Try up to twice for each model
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[LuxeScribe AI] Contacting model candidate: ${model} (Attempt ${attempt}/${retries})`);
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        console.log(`[LuxeScribe AI] Successfully generated content using model: ${model}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMessage = String(err?.message || err || "");
        const isTransient = 
          errMessage.includes("503") || 
          errMessage.includes("UNAVAILABLE") || 
          errMessage.includes("429") ||
          errMessage.includes("RESOURCE_EXHAUSTED") ||
          errMessage.includes("overloaded");

        if (isTransient && attempt < retries) {
          const delay = attempt * 800; // backoff delay
          console.warn(`[LuxeScribe AI Warning] Candidate model ${model} returned transient error, retrying in ${delay}ms...`, errMessage);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.warn(`[LuxeScribe AI Warning] Candidate model ${model} attempt ${attempt} failed:`, errMessage);
          break; // Move to the next model in candidateModels
        }
      }
    }
  }

  throw lastError || new Error("All premium boutique candidate models are currently over capacity. Please try again.");
}

// ----------------- AI COPYWRITER & DESIGNER ENDPOINT -----------------
app.post("/api/ai/copywriter", async (req: Request, res: Response) => {
  try {
    const { concept, category, brand, targetQuality } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Please provide a concept description." });
    }

    const prompt = `Write high-end luxury boutique catalog details for a luxury writing product.
Boutique Concept: "${concept}"
Category Level: "${category || "Pens"}"
Brand Association: "${brand || "LuxeScribe Artisans"}"
Target Vibe: "${targetQuality || "Timeless Classic"}"

Create an exquisite, refined product name, an evocative luxury description, a suggested high-end price in USD (numeric), and an elegant SKU (such as LS-PEN-TML-XX). Include a short luxury justification.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: "You are an elite copywriter and brand strategist for LuxeScribe, a high-end luxury office supply and writing instrument boutique.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["name", "description", "price", "sku", "reasoning"],
          properties: {
            name: {
              type: Type.STRING,
              description: "Elegant, poetically refined luxury product name.",
            },
            description: {
              type: Type.STRING,
              description: "A gorgeous, sensory product description for our high-end catalog.",
            },
            price: {
              type: Type.NUMBER,
              description: "Suggested retail price in USD. A reasonable premium writing instrument price (e.g., $150 - $1250).",
            },
            sku: {
              type: Type.STRING,
              description: "Sleek, elite model identifier matching our pattern (e.g., LS-[CAT]-[ID]).",
            },
            reasoning: {
              type: Type.STRING,
              description: "Boutique director justification for this pricing and branding.",
            },
          },
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("AI Copywriter execution error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while communicating with the AI model.",
    });
  }
});

// ----------------- VIP OUTREACH EMAIL ENDPOINT -----------------
app.post("/api/ai/vip-outreach", async (req: Request, res: Response) => {
  try {
    const { name, email, loyaltyTier, points, totalSpend, purpose } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Customer name is required." });
    }

    const prompt = `Generate a highly personalized outreach letter for a boutique customer on behalf of LuxeScribe Pro.
Customer Coordinates:
- Name: ${name}
- Email: ${email || "VIP Patron"}
- Loyalty Level: ${loyaltyTier || "Elite"}
- Loyalty Points: ${points || 0} pts
- Lifetime Value Spent: $${totalSpend || 0}
- Outreach Purpose: ${purpose || "Loyalty appreciation & elite invitation"}

Make the tone extremely elegant, warm, respectful, and sophisticated. Offer them a bespoke concierge service or special loyalty tier rewards. Include a specific luxury writing instrument recommendation.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: "You are the Head of Guest Relations and Concierge Services at LuxeScribe boutique. Your communication is flawlessly elegant and personalized.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["subject", "body", "recommendation"],
          properties: {
            subject: {
              type: Type.STRING,
              description: "Majestic, elegant email subject line.",
            },
            body: {
              type: Type.STRING,
              description: "The complete, polished letter including graceful greetings and sign-off.",
            },
            recommendation: {
              type: Type.STRING,
              description: "Bespoke high-end product recommendation tailored for this tier.",
            },
          },
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("VIP Outreach execution error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating outreach letter.",
    });
  }
});

// ----------------- DEMAND FORECAST ENDPOINT -----------------
app.post("/api/ai/demand-forecast", async (req: Request, res: Response) => {
  try {
    const { products, salesHistory } = req.body;

    const productsBrief = Array.isArray(products)
      ? products.map((p: any) => `${p.name} (SKU: ${p.sku}, Category: ${p.category}, Stock: ${p.stock}, Sold: ${p.soldQuantity})`).join("\n")
      : "No products metadata provided.";

    const prompt = `Perform an exquisite business demand and intelligence audit for LuxeScribe boutique.
Active Catalog Metrics:
${productsBrief}

Generate a beautiful strategic executive summary projecting the next quarter's boutique writing trends, a list of critical inventory procurement priorities, and curated market insight trends for executive decision-making.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: "You are the Chief Financial Officer and Boutique Logistics Director at LuxeScribe. Your intelligence audits are rich, analytical, and highly structured.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "priorities", "marketInsight"],
          properties: {
            summary: {
              type: Type.STRING,
              description: "Polished multi-sentence strategic demand forecast executive summary.",
            },
            priorities: {
              type: Type.ARRAY,
              description: "Bespoke priorities for supplier order planning.",
              items: {
                type: Type.OBJECT,
                required: ["category", "skuOrItem", "actionRequired", "urgency"],
                properties: {
                  category: { type: Type.STRING, description: "Boutique category (e.g. Pens, Ink)." },
                  skuOrItem: { type: Type.STRING, description: "Suggested stock SKU or item name." },
                  actionRequired: { type: Type.STRING, description: "Bespoke procurement advice." },
                  urgency: { type: Type.STRING, description: "Urgency rating: 'High', 'Medium', or 'Low'." },
                },
              },
            },
            marketInsight: {
              type: Type.STRING,
              description: "Fine curated retail trends related to premium journals, custom inks, or writing heritage.",
            },
          },
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Demand Forecast execution error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while parsing forecast analytics.",
    });
  }
});

// ----------------- BOUTIQUE CO-PILOT CHAT ENDPOINT -----------------
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { question, history, currentInventoryBrief } = req.body;
    if (!question) {
      return res.status(400).json({ error: "What would you like to ask?" });
    }

    let fullPrompt = "";
    if (currentInventoryBrief) {
      fullPrompt += `Boutique Current Inventory Status:\n${currentInventoryBrief}\n\n`;
    }
    fullPrompt += `User Query: "${question}"`;

    const systemInstruction = `You are "ScribeOracle AI", the resident intelligent co-pilot and business strategist integrated within LuxeScribe Pro portal.
You advise the boutique owner on sales performance, writing instruments history, inventory replenishment, luxury retailing techniques, writing culture, brand design, and general POS strategies.
Keep your answer visually beautiful using concise, well-padded elegant Markdown formats, bullet points, or subtle tables. Speak with prestige, helpful expertise, and focus purely on practical operations.`;

    const response = await generateContentWithFallback({
      contents: fullPrompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "Graceful greetings. I am ready to advise you on your boutique affairs.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Boutique Oracle execute error:", error);
    res.status(500).json({
      error: error.message || "My conversational core encountered a brief interruption. Please check your config.",
    });
  }
});

export default app;
