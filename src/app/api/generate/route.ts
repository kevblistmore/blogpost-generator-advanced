// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    if (!body) {
      throw new Error('Request body is empty');
    }
    const { topic, title } = JSON.parse(body);

    // More explicit markdown prompt:
    const promptText = `
      Write a comprehensive blog post about "${title || topic}" using markdown formatting only.
      **Do not** wrap the entire text in triple backticks.
      Use headings, paragraphs, and lists in Markdown.
      Return the content directly without any code fences.
      `;
    
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: promptText }],
      temperature: 0.7,
    });
    
    const content = response.data.choices[0]?.message?.content || '';
    //console.log('Generated content:', content);
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

// // app/api/generate/route.ts
// import { NextResponse } from 'next/server';
// import { Configuration, OpenAIApi } from 'openai';

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// export async function POST(request: Request) {
//   try {
//     const { topic, title,previousContent } = await request.json();
    
//     // Only include previous content if it exists
//     const extraPrompt = previousContent ? previousContent.slice(0, 500) : '';

//     // More explicit markdown prompt:
//     const promptText = `
//       Write a comprehensive blog post about "${title || topic}" using markdown formatting only.
//       **Do not** wrap the entire text in triple backticks.
//       Use headings, paragraphs, and lists in Markdown.
//       Return the content directly without any code fences.
//       ${extraPrompt}...
//     `;
    
//     const response = await openai.createChatCompletion({
//       model: 'gpt-4o',
//       messages: [{ role: 'user', content: promptText }],
//       temperature: 0.7,
//     });
    
//     const content = response.data.choices[0]?.message?.content || '';
//     //console.log('Generated content:', content);
//     return NextResponse.json({ content });
    
//   } catch (error) {
//     console.error('Generation error:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate content' },
//       { status: 500 }
//     );
//   }
// }
