/**
 * API Route: Generate content using Deep Agents
 */

import { NextRequest, NextResponse } from "next/server";
import { createDeepAgent } from "deepagents";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "langchain";
import * as z from "zod";

// Schema for generation output
const GenerationOutputSchema = z.object({
  generatedMessage: z.string(),
  reasoning: z.string(),
});

// System prompt for content generation
const GENERATION_PROMPT = `You are an intelligent writing agent that helps users expand their saved messages.
Analyze the existing saved messages and generate new content that aligns with the user's writing style and intent.
Your goal is to produce meaningful additions, reflections, or next steps based on the context.

When generating content:
1. Match the writing style of the existing messages
2. Consider the themes and topics present
3. Generate content that logically extends or complements the existing messages
4. Provide clear reasoning for why your generated content fits

Always respond with a JSON object containing:
- generatedMessage: The new message text that fits naturally
- reasoning: A brief explanation of why this addition fits the context`;

// Writing style analysis tool
const analyzeStyleTool = tool(
  async ({ messages }: { messages: string }) => {
    return `Analyzing writing style from: ${messages}`;
  },
  {
    name: "analyze_style",
    description: "Analyze the writing style of existing messages",
    schema: z.object({
      messages: z.string().describe("The messages to analyze"),
    }),
  }
);

export async function POST(request: NextRequest) {
  try {
    const { messages, intent } = await request.json();

    if (!messages || !Array.isArray(messages) || !intent) {
      return NextResponse.json(
        { error: "Messages array and intent required" },
        { status: 400 }
      );
    }

    // Format messages for processing
    const formattedMessages = messages
      .map(
        (m: { title: string; content: string }, i: number) =>
          `[${i + 1}] ${m.title}: ${m.content}`
      )
      .join("\n\n");

    // Initialize Gemini model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      maxOutputTokens: 8192,
    });

    // Create the deep agent
    const agent = createDeepAgent({
      model,
      tools: [analyzeStyleTool],
      systemPrompt: GENERATION_PROMPT,
    });

    // Invoke the agent
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `Based on these saved messages:\n\n${formattedMessages}\n\nUser Intent: ${intent}\n\nGenerate new content that fits naturally. Respond with a JSON object containing generatedMessage and reasoning.`,
        },
      ],
    });

    // Extract the last message content
    const lastMessage = result.messages[result.messages.length - 1];
    const content =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    // Parse the JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const validated = GenerationOutputSchema.parse(parsed);
        return NextResponse.json(validated);
      }

      return NextResponse.json({
        generatedMessage: content.slice(0, 500),
        reasoning: "Generated based on context analysis",
      });
    } catch {
      return NextResponse.json({
        generatedMessage: content.slice(0, 500),
        reasoning: "Unable to parse structured response",
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Generation error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is missing from environment variables");
      return NextResponse.json(
        { error: "Google API Key is not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate content: ${errorMessage}` },
      { status: 500 }
    );
  }
}
