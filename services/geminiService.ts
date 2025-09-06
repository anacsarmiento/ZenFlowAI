import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { YogaRecommendation, YouTubeVideo } from '../types';

// Lazy-initialized AI client to ensure the API key is checked before use.
let ai: GoogleGenAI;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    // FIX: Switched to using `process.env.API_KEY` for the Gemini API key as per coding guidelines.
    // The key is assumed to be pre-configured in the application's environment.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }
  return ai;
}


const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        busynessLevel: {
            type: Type.STRING,
            enum: ['Busy', 'Moderate', 'Relaxed'],
            description: "The assessed busyness level of the calendar.",
        },
        recommendedFlow: {
            type: Type.STRING,
            description: "The name of the recommended yoga flow (e.g., 'Restorative Yoga').",
        },
        reasoning: {
            type: Type.STRING,
            description: "A brief explanation for why this flow was recommended based on the calendar.",
        },
        samplePose: {
            type: Type.STRING,
            description: "The name of a single, representative yoga pose from the recommended flow (e.g., 'Child's Pose').",
        },
    },
    required: ['busynessLevel', 'recommendedFlow', 'reasoning', 'samplePose'],
};


export const analyzeCalendarAndRecommendFlow = async (calendarText: string): Promise<YogaRecommendation> => {
    const prompt = `
        You are a yoga and wellness expert. Analyze the provided calendar schedule to determine its busyness level.
        Based on the busyness, recommend a suitable yoga flow.
        - If the day is packed with back-to-back meetings and activities, it's a 'Busy' day. Recommend a restorative or yin yoga flow to help de-stress and relax.
        - If the day has a mix of meetings and free time, it's a 'Moderate' day. Recommend a balanced hatha or gentle flow.
        - If the day is mostly open with few commitments, it's a 'Relaxed' day. Recommend an energetic vinyasa or power yoga flow to build energy and strength.

        Provide a brief reasoning for your recommendation and suggest one sample pose from the recommended flow.
        The user's calendar is:
        ---
        ${calendarText}
        ---
    `;

    try {
        const response = await getAiClient().models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        return result as YogaRecommendation;

    } catch (error) {
        console.error("Error analyzing calendar:", error);
        if (error instanceof Error) {
            throw error; // Re-throw the original error to be displayed in the UI
        }
        throw new Error("Failed to get a recommendation from the AI.");
    }
};

export const generatePoseImage = async (poseName: string): Promise<string> => {
    const prompt = `A serene, minimalist digital art illustration of a person doing the ${poseName} yoga pose. The person should be gender-neutral. The background should be a solid, calming, soft green color. The style should be clean, modern, and peaceful.`;

    try {
        const response = await getAiClient().models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating pose image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate the yoga pose image.");
    }
};

export const fetchYouTubeFlows = async (flowName: string): Promise<{ videos: YouTubeVideo[], sources: any[] }> => {
    const prompt = `
        You are a helpful yoga assistant. 
        1. Use Google Search to find 3 popular, free, and highly-rated yoga flow videos on YouTube for a "${flowName}" practice.
        2. From the real search results, extract the video title, channel name, and the correct 11-character YouTube video ID. Do not invent video IDs.
        
        Return ONLY a single, minified JSON array of objects. Each object must have "title", "channel", and "videoId" keys.
    `;

    try {
        const response: GenerateContentResponse = await getAiClient().models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 0 } // Disables thinking for lower latency.
            },
        });

        let jsonText = response.text.trim();
        
        // The model might sometimes wrap the JSON in markdown or other text. 
        // This regex attempts to extract just the JSON array.
        const match = jsonText.match(/(\[[\s\S]*\])/);
        if (match && match[0]) {
            jsonText = match[0];
        } else {
            // If no array is found, the response is likely invalid.
            throw new Error("Model did not return a valid JSON array.");
        }

        const videos: YouTubeVideo[] = JSON.parse(jsonText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        
        return { videos, sources };

    } catch (error) {
        console.error("Error fetching YouTube flows with grounding:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to get YouTube video recommendations from the AI.");
    }
};