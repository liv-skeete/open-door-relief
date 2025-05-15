/**
 * Content moderation utilities
 */

// Common swear words to filter
const SWEAR_WORDS = [
  'ass', 'asshole', 'bastard', 'bitch', 'bullshit', 'cunt', 'damn', 'dick', 'fuck', 'shit', 'piss'
];

// Words that might be legitimate in addresses or other contexts
const ALLOWED_EXCEPTIONS = [
  'Ass Street', 'Ass Road', 'Ass Avenue', 'Ass Lane', 'Ass Drive', 'Ass Court', 'Ass Place',
  'Scunthorpe', 'Penistone', 'Dickson', 'Hancock', 'Woodcock', 'Glascock', 'Cockburn',
  'Shitterton', 'Fucking', 'Assington', 'Clitheroe', 'Cockermouth'
];

/**
 * Checks if text contains inappropriate content while allowing exceptions
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text is clean or contains allowed exceptions
 */
export const isContentAppropriate = (text) => {
  if (!text) return true;
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check for allowed exceptions first
  for (const exception of ALLOWED_EXCEPTIONS) {
    if (lowerText.includes(exception.toLowerCase())) {
      // Replace the exception with a placeholder to avoid false positives
      const safeText = lowerText.replace(exception.toLowerCase(), '____SAFE____');
      
      // Check if the modified text contains swear words
      return !containsSwearWords(safeText);
    }
  }
  
  // If no exceptions found, just check for swear words
  return !containsSwearWords(lowerText);
};

/**
 * Checks if text contains any swear words
 * @param {string} text - The lowercase text to check
 * @returns {boolean} - True if the text contains swear words
 */
const containsSwearWords = (text) => {
  // Check for whole words only using word boundaries
  for (const word of SWEAR_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(text)) {
      return true;
    }
  }
  return false;
};

/**
 * Sanitizes text by replacing inappropriate content with asterisks
 * while preserving allowed exceptions
 * @param {string} text - The text to sanitize
 * @returns {string} - The sanitized text
 */
export const sanitizeContent = (text) => {
  if (!text) return text;
  
  let sanitizedText = text;
  
  // Temporarily replace allowed exceptions with placeholders
  const placeholders = {};
  ALLOWED_EXCEPTIONS.forEach((exception, index) => {
    const placeholder = `__SAFE_${index}__`;
    const regex = new RegExp(exception, 'gi');
    sanitizedText = sanitizedText.replace(regex, placeholder);
    placeholders[placeholder] = exception;
  });
  
  // Replace swear words with asterisks
  SWEAR_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitizedText = sanitizedText.replace(regex, '*'.repeat(word.length));
  });
  
  // Restore allowed exceptions
  Object.entries(placeholders).forEach(([placeholder, original]) => {
    sanitizedText = sanitizedText.replace(new RegExp(placeholder, 'g'), original);
  });
  
  return sanitizedText;
};