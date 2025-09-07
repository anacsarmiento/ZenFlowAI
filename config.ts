// This file is reserved for application configuration.

// The Gemini API Key is automatically provided by the environment.
export const GEMINI_API_KEY = process.env.API_KEY;

// --- ACTION REQUIRED ---
// Paste your Google Cloud credentials below.
// You need to create these in your own Google Cloud project.
// 1. Get an API Key: https://developers.google.com/workspace/guides/create-credentials#api-key
// 2. Get an OAuth Client ID: https://developers.google.com/workspace/guides/create-credentials#oauth-client-id
//
// IMPORTANT: When creating the OAuth Client ID, you MUST add the URL of this web app
// to the "Authorized JavaScript origins" section.

/**
 * The API key for Google Cloud services, used here for the Calendar API.
 * Replace the placeholder string with your actual API key.
 */
export const GOOGLE_API_KEY = "PASTE_YOUR_GOOGLE_API_KEY_HERE";

/**
 * The OAuth 2.0 Client ID for authenticating users with their Google account.
 * Replace the placeholder string with your actual Client ID.
 */
export const GOOGLE_CLIENT_ID = "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";
