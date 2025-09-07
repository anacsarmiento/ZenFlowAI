import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { YogaRecommendation, YouTubeVideo } from '../types';

// Lazy-initialized AI client to ensure the API key is checked before use.
let ai: GoogleGenAI;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not found.");
    }
    ai = new GoogleGenAI({ apiKey });
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
    const systemInstruction = `You are a meticulous research assistant and yoga content curator. Your primary goal is to find a single, recent, and **verifiably active** YouTube video for a specific yoga flow. You must be extremely diligent to avoid recommending broken or unavailable links. Your work is critical for user trust.`;
    
    const prompt = `
        Find a YouTube video for a "${flowName}" yoga flow. Follow these steps precisely:
        1.  **Prioritize Recency:** Your highest priority is finding a video uploaded in the last 2 years. Search for "${flowName} yoga 2024" or "${flowName} yoga class 2023". Recent videos are far more likely to be active.
        2.  **Initial Selection:** From the search results, identify a promising video. Extract its title, channel name, and the 11-character YouTube video ID.
        3.  **Crucial Verification - The Most Important Step:** You MUST verify the video is still active. Perform a new, targeted Google search using the exact query: "site:youtube.com watch?v=[the video ID]".
        4.  **Analyze Verification Snippets:** Scrutinize the short text snippets that appear under the search result links. The mere existence of a link is **NOT** sufficient proof of availability.
            - **INVALID if:** The snippet contains ANY of these phrases: "This video isn't available anymore", "This video is unavailable", "This video is private", "Video deleted", "Video removed by the user".
            - **VALID if:** The snippet shows a normal description of the video content.
        5.  **Decision:** If you see any warning text in the verification search, you MUST DISCARD the video immediately and go back to step 1 to find a different one. Do not take risks. If you have any doubt, discard it.
        6.  **Output:** Once you have found a video that passes this rigorous verification, return ONLY a single, minified JSON array containing exactly ONE video object. The object must have "title", "channel", and "videoId" keys. If you cannot find a single verifiable video after several attempts, return an empty array []. Do not add any explanatory text, commentary, or markdown fences before or after the JSON array. Your entire response must be only the JSON.
    `;

    try {
        const response: GenerateContentResponse = await getAiClient().models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
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