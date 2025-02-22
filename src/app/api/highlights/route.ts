// src/app/api/highlights/route.ts
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const prompt = `Extract the following from the blog post as a JSON object with keys "keywords", "phrases", and "summary". Each key should have an array of strings.
Blog post:
${content}`;

    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const rawHighlights = response.data.choices[0]?.message?.content || "[]";
    // Clean up the output if needed
    const cleanedHighlights = rawHighlights
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const highlights = JSON.parse(cleanedHighlights);
    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Highlights error:", error);
    return NextResponse.json({ highlights: [] }, { status: 500 });
  }
}
