import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '../config';

// This service handles all interactions with the Google Calendar API.
const API_KEY = GOOGLE_API_KEY;
const CLIENT_ID = GOOGLE_CLIENT_ID;

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let gapi: any = (window as any).gapi;
let google: any = (window as any).google;
let tokenClient: any;

/**
 * Initializes the Google API client and token client.
 * @param updateSigninStatus A callback function to update the sign-in status in the React component.
 * @param updateError A callback function to report configuration errors to the UI.
 */
export const initGoogleClient = (
    updateSigninStatus: (isSignedIn: boolean) => void,
    updateError: (errorMsg: string) => void
) => {
    if (!API_KEY || !CLIENT_ID || API_KEY.startsWith("PASTE_") || CLIENT_ID.startsWith("PASTE_")) {
        const errorMessage = "Your Google API Key or Client ID is not set. Please follow the instructions in 'config.ts' to enable calendar sync.";
        console.error(errorMessage);
        updateError(errorMessage);
        return;
    }

    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
                // This callback is triggered after user grants consent
                if (tokenResponse && tokenResponse.access_token) {
                    gapi.client.setToken(tokenResponse);
                    updateSigninStatus(true);
                } else {
                    console.error('No access token received.');
                    updateSigninStatus(false);
                }
            },
        });
        
        // Check initial sign-in state
        // A simple check if there is an access token. A robust app might check token expiry.
        if (gapi.client.getToken() !== null) {
            updateSigninStatus(true);
        } else {
            updateSigninStatus(false);
        }
    });
};

/**
 *  Sign in the user upon button click.
 */
export const handleSignInClick = () => {
  if (!tokenClient) {
    console.error("Google Token Client not initialized.");
    return;
  }
  // Prompt the user to select a Google Account and ask for consent to share their data
  // when establishing a new session.
  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // If we have a token, just request it silently.
    tokenClient.requestAccessToken({ prompt: '' });
  }
};


/**
 *  Sign out the user upon button click.
 */
export const handleSignOutClick = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken('');
    });
  }
};


/**
 * Fetches events from the user's primary calendar for the current day
 * and formats them into a string.
 * @returns A promise that resolves with the formatted string of today's events.
 */
export const listTodaysEvents = async (): Promise<string> => {
    if (!gapi.client) {
        throw new Error("GAPI client is not initialized.");
    }
    
    try {
        const now = new Date();
        const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
        const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

        const request = {
            'calendarId': 'primary',
            'timeMin': timeMin,
            'timeMax': timeMax,
            'showDeleted': false,
            'singleEvents': true,
            'orderBy': 'startTime'
        };

        const response = await gapi.client.calendar.events.list(request);
        const events = response.result.items;

        if (!events || events.length === 0) {
            return 'No upcoming events found for today.';
        }

        const formatTime = (dateTimeString: string) => {
            const date = new Date(dateTimeString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        
        const eventStrings = events.map((event: any) => {
            const start = event.start.dateTime || event.start.date;
            const end = event.end.dateTime || event.end.date;

            // Handle all-day events vs. timed events
            if (event.start.date) { // All-day event
                 return `All Day: ${event.summary}`;
            } else { // Timed event
                return `${formatTime(start)} - ${formatTime(end)}: ${event.summary}`;
            }
        });

        return eventStrings.join('\n');
    } catch (err: any) {
        console.error('Google API Error:', err);
        // Check for specific auth error to guide user
        if (err.result && err.result.error && err.result.error.status === 'PERMISSION_DENIED') {
            throw new Error("Permission denied. Please ensure you have granted calendar access.");
        }
        throw new Error('Could not fetch events from Google Calendar.');
    }
};
