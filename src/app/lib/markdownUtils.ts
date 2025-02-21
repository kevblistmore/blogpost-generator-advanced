import { marked } from 'marked';

/**
 * Converts markdown content to HTML.
 * @param {string} markdown - Raw markdown string.
 * @returns {Promise<string>} - HTML string.
 */
export const convertMarkdownToHTML = async (markdown: string): Promise<string> => {
  return await marked(markdown);
};
