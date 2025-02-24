// src/app/api/refine/route.ts
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { content, feedback } = await request.json();
    const prompt = `Here is a blog post:
      ${content}

      User feedback: ${feedback}

      Please provide a refined version of the blog post based on the feedback.`;

    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const refinedContent = response.data.choices[0]?.message?.content || "";
    console.log("Refined content:", refinedContent);
    return NextResponse.json({ 
      refinedContent,
      previousContent: content // Include previous content for versioning
    });
  } catch (error) {
    console.error("Refinement error:", error);
    return NextResponse.json({ error: "Failed to refine content" }, { status: 500 });
  }
}
