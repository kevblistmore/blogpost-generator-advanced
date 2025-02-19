// app/lib/validation.ts
import { z } from 'zod';

/**
 * Validates that the user-provided topic is 3-100 characters in length.
 */
export const topicSchema = z.object({
  topic: z
    .string()
    .min(3, 'Topic must be at least 3 characters')
    .max(100, 'Topic is too long (max 100 characters)'),
});

/**
 * Optionally remove any extra markdown characters from the AI output
 */
export function sanitizeOutput(content: string) {
  return content.replace(/[*#_\[\]~`]/g, '');
}
