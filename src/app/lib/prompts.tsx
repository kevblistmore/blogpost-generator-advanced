// // app/lib/prompts.ts

// /**
//  * Generates a prompt string for the AI to create a structured blog post
//  * about the given topic.
//  */
// export function generateBlogPrompt(topic: string): string {
//     return `
//     You are a professional blog writer. Please create a structured blog post about "${topic}" with these guidelines:
//     1. Start with a brief introduction (1-2 paragraphs).
//     2. Include 3 main sections with subheadings, each with specific examples or tips.
//     3. Provide a conclusion summarizing the key points.
//     4. Use an engaging and approachable tone.
//     5. Do not use markdown (plain text only).
  
//     Format Example:
//     INTRODUCTION
  
//     SECTION 1:
//     [Your content]
  
//     SECTION 2:
//     [Your content]
  
//     SECTION 3:
//     [Your content]
  
//     CONCLUSION
//     `;
//   }

// lib/prompts.ts
export function generateBlogPrompt(topic: string, style: string = 'professional') {
  return `
  As a professional content writer with 10+ years experience, create a comprehensive blog post about "${topic}".
  
  Requirements:
  1. Tone: ${style} (choose from professional, casual, technical)
  2. Structure:
    - Engaging introduction (2 paragraphs)
    - 3 main sections with H2 headings
    - 2-3 subsections per main section (H3)
    - Conclusion with key takeaways
  3. Include:
    - Real-world examples
    - Actionable advice
    - Relevant statistics (mark with *)
  4. Formatting:
    - No markdown
    - Wrap statistics with **asterisks**
    - Use line breaks between sections
    
  Example Structure:
  Introduction...
  
  ## Main Section 1
  Content...
  
  ### Subsection 1.1
  Content...
  
  ## Main Section 2
  Content...
  `;
}