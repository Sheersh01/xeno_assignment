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
        },
        reasoning: { type: SchemaType.STRING }
      },
      required: ["segmentName", "description", "query", "reasoning"]
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

    const prompt = `You are an expert marketer. Generate 3 DISTINCT variations of a marketing message based on the goal and audience. 
Make Variant A focused on Urgency/FOMO.
Make Variant B focused on Value/Benefit.
Make Variant C Casual/Friendly.
Goal: ${campaignGoal}
Audience: ${segmentDescription}
Return a JSON object with an array "variants" containing exactly 3 objects, each with "subject" and "message". The message should be plain text, engaging, and under 250 characters.`;

    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        variants: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              subject: { type: SchemaType.STRING },
              message: { type: SchemaType.STRING }
            },
            required: ["subject", "message"]
          }
        }
      },
      required: ["variants"]
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const parsed = JSON.parse(result.response.text());
    // Ensure we always return exactly 3
    if (parsed.variants && parsed.variants.length >= 3) {
      return parsed.variants.slice(0, 3);
    }
    throw new Error("Invalid variants array returned from AI");
  } catch (error) {
    console.error("AI Error (generateCampaignMessage):", error.message);
    return [
      { subject: "Flash Sale Ends Soon!", message: "Hurry, check out our latest offers tailored just for you before they're gone!" },
      { subject: "Unlock Your Exclusive Value", message: "Discover premium benefits and savings waiting for you inside." },
      { subject: "Hey there! Just checking in", message: "We thought you might like to see what's new in store for you." }
    ];
  }
}

export async function analyzeSentiment(replyText: string) {
  try {
    if (!apiKey) throw new Error("No API key");

    const prompt = `You are a customer sentiment analyzer. Classify the following customer reply into exactly one of these three categories:
- OPT_OUT: The user wants to stop receiving messages, unsubscribe, or is angry.
- QUESTION: The user is asking a question about the product or service.
- POSITIVE: The user is expressing satisfaction or simple acknowledgment.

Reply: "${replyText}"

Return a JSON object with a single "sentiment" string matching one of the three categories exactly.`;

    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        sentiment: { type: SchemaType.STRING, enum: ["OPT_OUT", "QUESTION", "POSITIVE"] }
      },
      required: ["sentiment"]
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    return JSON.parse(result.response.text()).sentiment;
  } catch (error) {
    console.error("AI Error (analyzeSentiment):", error.message);
    // Safe fallback
    return "QUESTION";
  }
}

export async function generateABTestInsight(winnerVariant: any, allVariants: any[]) {
  try {
    if (!apiKey) throw new Error("No API key");

    const prompt = `You are a marketing data scientist. We ran an A/B/C test on 3 message variants.
Winning Variant: ${JSON.stringify(winnerVariant)}
All Variants: ${JSON.stringify(allVariants)}

Provide a very concise 1-2 sentence explanation of WHY the winning variant likely outperformed the others (e.g., focusing on its tone, urgency, or clarity).

Return a JSON object with a single "insight" string.`;

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
    console.error("AI Error (generateABTestInsight):", error.message);
    return "The winning variant achieved the highest engagement score.";
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
