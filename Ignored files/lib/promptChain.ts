// // src/app/lib/promptChain.ts

// import { Configuration, OpenAIApi } from 'openai';

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// export async function generateBlogWithChaining(topic: string, style: string) {
//   try {
//     // Step 1: Generate outline
//     const outlinePrompt = `
//       Create a structured outline for a blog post about "${topic}".
//       Format the outline as a JSON object with sections and a brief bullet list of what each section should contain.
//       `;
//     const outlineResponse = await openai.createChatCompletion({
//       model: 'gpt-4o',
//       messages: [{ role: 'user', content: outlinePrompt }],
//       temperature: 0.7,
//     });
//     const rawOutline = outlineResponse.data.choices[0]?.message?.content?.trim() || '{}';
//     const outline = JSON.parse(rawOutline);

//     // Step 2: Expand each section based on the outline
//     let expandedBlog = '';
//     for (const section of outline.sections) {
//       const expandPrompt = `
//         Write a ${style} style paragraph for the section titled "${section.title}".
//         Key points: ${section.keyPoints.join(', ')}.
//       `;
//       const expandResponse = await openai.createChatCompletion({
//         model: 'gpt-4o',
//         messages: [{ role: 'user', content: expandPrompt }],
//         temperature: 0.7,
//       });
//       const expandedText = expandResponse.data.choices[0]?.message?.content || '';
//       expandedBlog += `## ${section.title}\n\n${expandedText}\n\n`;
//     }

//     // Step 3: Refine the entire blog
//     const refinePrompt = `
//       Refine the following blog content to ensure clarity, coherence, and proper paragraph structure:
//       ${expandedBlog}
//     `;
//     const refineResponse = await openai.createChatCompletion({
//       model: 'gpt-4o',
//       messages: [{ role: 'user', content: refinePrompt }],
//       temperature: 0.7,
//     });
//     const refinedContent = refineResponse.data.choices[0]?.message?.content || '';

//     return refinedContent;
//   } catch (error) {
//     console.error('Error in prompt chain:', error);
//     return 'An error occurred during prompt chaining.';
//   }
// }