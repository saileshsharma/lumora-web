/**
 * Input Sanitization Utilities
 * Prevents XSS and other security vulnerabilities
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};

/**
 * Sanitize text (strip all HTML)
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url: string): string | null => {
  try {
    const parsedURL = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedURL.protocol)) {
      return null;
    }

    return parsedURL.toString();
  } catch {
    return null;
  }
};

/**
 * Escape special regex characters in string
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate image data URL
 */
export const isValidImageDataURL = (dataURL: string): boolean => {
  return /^data:image\/(jpeg|jpg|png|webp);base64,/.test(dataURL);
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  escapeRegex,
  isValidImageDataURL,
};
