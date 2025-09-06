/**
 * Calculates a busyness score from 0 to 100 based on calendar text.
 * A simple heuristic is used: count lines that appear to be events.
 * An "event" is loosely defined as a line containing a time format (e.g., "9:00 AM", "14:30").
 * @param text The raw text from the user's calendar.
 * @returns A number from 0 to 100.
 */
export const calculateBusyness = (text: string): number => {
  if (!text.trim()) {
    return 0;
  }

  const lines = text.split('\n');
  const eventRegex = /\d{1,2}:\d{2}/; // Matches patterns like "9:00", "14:30"
  
  let eventCount = 0;
  for (const line of lines) {
    if (eventRegex.test(line)) {
      eventCount++;
    }
  }

  // Normalize the score. Let's consider 8 or more events as 100% busy for a single day.
  const maxEventsForNormalization = 8;
  const score = Math.min(eventCount / maxEventsForNormalization, 1) * 100;
  
  return Math.round(score);
};
