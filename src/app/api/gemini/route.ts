import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { message: 'Missing GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const { prompt, type } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { message: 'Prompt not provided in the request body.' },
        { status: 400 }
      );
    }

    let geminiPrompt: string;
    if (type === 'decompose') {
      geminiPrompt = `Analyze the following user request and decompose it into a JSON array of discrete, executable CLI commands. Each command object should have a 'command' field (the CLI command) and a 'description' field (a brief explanation). Ensure the response is a valid JSON array and contains only the JSON.

User Request: "${prompt}"

Example format:
[
  { "command": "mkdir my-project", "description": "Create a new directory for the project" },
  { "command": "cd my-project", "description": "Navigate into the project directory" }
]
`;
    } else {
      geminiPrompt = prompt; // Standard chat prompt
    }

    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;

    console.log('Full Gemini API response object:', JSON.stringify(response, null, 2));

    let text = response.text();
    console.log('Gemini response text() result:', text);

    // Attempt to parse JSON if it's a decomposition request
    if (type === 'decompose') {
      try {
        // Gemini might include markdown ```json around the JSON, so we need to clean it
        text = text.replace(/```json\n?|\n?```/g, '').trim();
        const commands = JSON.parse(text);
        return NextResponse.json({ commands });
      } catch (jsonError: any) {
        console.error('Failed to parse Gemini response as JSON for decomposition:', text, jsonError);
        return NextResponse.json(
          { message: 'Gemini responded, but failed to parse commands.', rawText: text, error: jsonError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { message: 'Error calling Gemini API', error: error.message },
      { status: 500 }
    );
  }
}