import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// We will use gemini-2.5-flash since 1.5 is deprecated in this environment
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateSegmentFilter(naturalLanguageInput: string) {
  try {
    if (!apiKey) throw new Error("No API key");
    
    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        segmentName: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        query: {
          type: SchemaType.OBJECT,
          properties: {
            totalSpend: {
              type: SchemaType.OBJECT,
              properties: {
                gt: { type: SchemaType.NUMBER },
                lt: { type: SchemaType.NUMBER }
              }
            },
            orderCount: {
              type: SchemaType.OBJECT,
              properties: {
                gt: { type: SchemaType.NUMBER },
                lt: { type: SchemaType.NUMBER }
              }
            },
            lastOrderDays: {
              type: SchemaType.OBJECT,
              properties: {
                gt: { type: SchemaType.NUMBER },
                lt: { type: SchemaType.NUMBER }
              }
            },
            city: {
              type: SchemaType.STRING
            }
          }
        }
      },
      required: ["segmentName", "description", "query"]
    };

    const prompt = `You are a CRM segment builder. Convert the user's natural language input into a strict JSON query.
Allowed query fields: totalSpend (object with gt/lt), orderCount (object with gt/lt), lastOrderDays (object with gt/lt), city (string).
Do not include fields that are not mentioned. Keep the JSON exactly to the schema.
Input: "${naturalLanguageInput}"`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Error (generateSegmentFilter):", error.message);
    // Graceful fallback
    return {
      segmentName: "Fallback Segment",
      description: "Could not generate segment via AI. Using empty query.",
      query: {}
    };
  }
}

export async function generateCampaignMessage(campaignGoal: string, segmentDescription: string) {
  try {
    if (!apiKey) throw new Error("No API key");

    const prompt = `You are an expert marketer. Generate a concise marketing message based on the goal and audience.
Goal: ${campaignGoal}
Audience: ${segmentDescription}
Return a JSON object with "subject" and "message". The message should be plain text, engaging, and under 250 characters.`;

    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        subject: { type: SchemaType.STRING },
        message: { type: SchemaType.STRING }
      },
      required: ["subject", "message"]
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Error (generateCampaignMessage):", error.message);
    return {
      subject: "Special Offer Inside",
      message: "Check out our latest offers tailored just for you!"
    };
  }
}

export async function recommendChannel(segmentProfile: any) {
  try {
    if (!apiKey) throw new Error("No API key");

    const prompt = `Recommend the best communication channel (WHATSAPP, EMAIL, SMS, or RCS) for this audience profile:
${JSON.stringify(segmentProfile)}

Return a JSON object with "recommendedChannel" and a brief "reason".`;

    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        recommendedChannel: { type: SchemaType.STRING },
        reason: { type: SchemaType.STRING }
      },
      required: ["recommendedChannel", "reason"]
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Error (recommendChannel):", error.message);
    return {
      recommendedChannel: "EMAIL",
      reason: "Email is a safe default when AI recommendation fails."
    };
  }
}

export async function generateSegmentExplainer(segmentProfile: any) {
  try {
    if (!apiKey) throw new Error("No API key");

    const prompt = `Provide a very short 1-2 sentence plain text summary of this audience segment. Make it sound professional and actionable.
Segment data: ${JSON.stringify(segmentProfile)}

Return a JSON object with a single "summary" string.`;

    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        summary: { type: SchemaType.STRING }
      },
      required: ["summary"]
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Error (generateSegmentExplainer):", error.message);
    return {
      summary: "This is a custom audience segment."
    };
  }
}

export async function generateCampaignInsight(campaignStats: any) {
  try {
    if (!apiKey) throw new Error("No API key");

    const prompt = `You are a data analyst. Analyze these campaign delivery stats and provide a single, actionable 1-2 sentence insight.
Stats: ${JSON.stringify(campaignStats)}

Return a JSON object with an "insight" string.`;

    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        insight: { type: SchemaType.STRING }
      },
      required: ["insight"]
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    return JSON.parse(result.response.text()).insight;
  } catch (error) {
    console.error("AI Error (generateCampaignInsight):", error.message);
    return "Campaign completed. Check individual stats for delivery details.";
  }
}
