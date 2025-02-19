// app/lib/prompts.ts

/**
 * Generates a prompt string for the AI to create a structured blog post
 * about the given topic.
 */
export function generateBlogPrompt(topic: string): string {
    return `
    You are a professional blog writer. Please create a structured blog post about "${topic}" with these guidelines:
    1. Start with a brief introduction (1-2 paragraphs).
    2. Include 3 main sections with subheadings, each with specific examples or tips.
    3. Provide a conclusion summarizing the key points.
    4. Use an engaging and approachable tone.
    5. Do not use markdown (plain text only).
  
    Format Example:
    INTRODUCTION
  
    SECTION 1:
    [Your content]
  
    SECTION 2:
    [Your content]
  
    SECTION 3:
    [Your content]
  
    CONCLUSION
    `;
  }
  