import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Parses markdown text into HTML and sanitizes it to prevent XSS.
 * @param text The markdown string to parse
 * @returns Sanitized HTML string
 */
export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Parse the markdown to HTML
  const rawHtml = marked.parse(text, { async: false, breaks: true }) as string;
  
  // Sanitize the HTML
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  
  return cleanHtml;
};
