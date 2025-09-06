// Function to convert hex to RGB
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Function to get a contrasting text color (black or white) for a given background hex color
export const getContrastingTextColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000'; // Default to black
  const { r, g, b } = rgb;
  // Formula to determine perceived brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Function to lighten or darken a color by a percentage
// `percent` should be between -1 (darker) and 1 (lighter)
export const adjustColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const calculate = (val: number) => {
    // Calculate the adjustment amount based on 255 (the max value for a color component)
    const amount = Math.round(255 * percent);
    const newVal = val + amount;
    // Clamp the value between 0 and 255
    return Math.max(0, Math.min(255, newVal));
  };

  const r = calculate(rgb.r);
  const g = calculate(rgb.g);
  const b = calculate(rgb.b);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
