/**
 * API Route: Summarize saved messages using LangChain
 */

import { NextRequest, NextResponse } from "next/server";
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as z from "zod";

// Schema for summarization output
const SummaryOutputSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  tone: z.string(),
});

// System prompt for summarization
const SUMMARIZATION_PROMPT = `You are an assistant that summarizes chat logs clearly and concisely.
Given a list of saved messages, produce a structured summary that captures the main ideas, key actions, and emotional tone.
Avoid redundancy and keep the summary under 200 words.

Always respond with a JSON object containing:
- summary: A concise overview of the conversation
- keyPoints: An array of 3-5 bullet points summarizing main topics
- tone: A brief description of the overall tone`;

// Summarization tool
const summarizeTool = tool(
  async ({ messages }: { messages: string }) => {
    return `Analyze and summarize these messages: ${messages}`;
  },
  {
    name: "summarize_messages",
    description: "Summarize a collection of saved messages",
    schema: z.object({
      messages: z.string().describe("The messages to summarize"),
    }),
  }
);

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
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

    // Create the agent
    const agent = createAgent({
      model,
      tools: [summarizeTool],
      systemPrompt: SUMMARIZATION_PROMPT,
    });

    // Invoke the agent
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `Please summarize the following saved messages:\n\n${formattedMessages}\n\nRespond with a JSON object containing summary, keyPoints array, and tone.`,
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
        const validated = SummaryOutputSchema.parse(parsed);
        return NextResponse.json(validated);
      }

      return NextResponse.json({
        summary: content.slice(0, 200),
        keyPoints: ["Unable to extract structured key points"],
        tone: "neutral",
      });
    } catch {
      return NextResponse.json({
        summary: content.slice(0, 200),
        keyPoints: ["Unable to parse response"],
        tone: "neutral",
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Summarization error details:", {
      message: errorMessage,
      stack: errorStack,
    });
    
    // Check if API key is missing
    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is missing from environment variables");
      return NextResponse.json(
        { error: "Google API Key is not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Failed to summarize messages: ${errorMessage}` },
      { status: 500 }
    );
  }
}
