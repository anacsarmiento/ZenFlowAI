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
        You are an expert data verifier and yoga assistant. Your primary goal is to find valid, publicly available YouTube videos.
        
        Follow these steps precisely:
        1.  Use Google Search to find popular, free, highly-rated yoga videos on YouTube for a "${flowName}" practice.
        2.  From the search results, extract the title, channel, and the 11-character YouTube video ID.
        3.  **Crucial Verification Step:** Before finalizing, for each video ID you find, perform a new, specific Google Search for "site:youtube.com [the video ID]". If the video is available, you will find a direct link. If it's unavailable, the search will yield no relevant results.
        4.  **Filter:** Only include videos that you successfully verified in the previous step. Discard any videos that appear to be unavailable or private.
        5.  **Output:** Return ONLY a single, minified JSON array containing up to 3 verified videos. Each object must have "title", "channel", and "videoId" keys. Do not invent video IDs or details. If you cannot find any verifiable videos, return an empty array [].
    `;

    try {
        const response: GenerateContentResponse = await getAiClient().models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                // Omitted thinkingConfig to use the default (enabled) setting for higher quality and complex reasoning.
            },
        });

        let jsonText = response.text.trim();
        
        const match = jsonText.match(/(\[[\s\S]*\])/);
        if (match && match[0]) {
            jsonText = match[0];
        } else {
            console.warn("Model did not return a valid JSON array. Assuming no videos were found.");
            return { videos: [], sources: [] };
        }

        const videos: YouTubeVideo[] = JSON.parse(jsonText);
        if (!Array.isArray(videos)) {
            console.warn("Parsed JSON is not an array. Assuming no videos were found.");
            return { videos: [], sources: [] };
        }

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        
        return { videos, sources };

    } catch (error) {
        console.error("Error fetching YouTube flows with grounding:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                 throw new Error("The AI returned a response in an unexpected format. Please try again.");
            }
            throw error;
        }
        throw new Error("Failed to get YouTube video recommendations from the AI.");
    }
};