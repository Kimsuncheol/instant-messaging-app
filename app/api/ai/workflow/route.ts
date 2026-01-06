/**
 * API Route: Workflow Controller using LangGraph
 * Coordinates between summarization and generation
 */

import { NextRequest, NextResponse } from "next/server";
import {
  MessagesAnnotation,
  StateGraph,
  START,
  END,
  Annotation,
} from "@langchain/langgraph";
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createDeepAgent } from "deepagents";
import * as z from "zod";

// Types
interface Message {
  title: string;
  content: string;
}

interface SummaryOutput {
  summary: string;
  keyPoints: string[];
  tone: string;
}

interface GenerationOutput {
  generatedMessage: string;
  reasoning: string;
}

// Extended state annotation
const WorkflowState = Annotation.Root({
  ...MessagesAnnotation.spec,
  savedMessages: Annotation<Message[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),
  summary: Annotation<SummaryOutput | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
  shouldGenerate: Annotation<boolean>({
    default: () => false,
    reducer: (_, next) => next,
  }),
  generatedContent: Annotation<GenerationOutput | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
});

type WorkflowStateType = typeof WorkflowState.State;

// Summarization setup
const SUMMARIZATION_PROMPT = `You are an assistant that summarizes chat logs. Respond with JSON containing summary, keyPoints array, and tone.`;

const summarizeTool = tool(
  async ({ messages }: { messages: string }) => `Summarize: ${messages}`,
  {
    name: "summarize",
    description: "Summarize messages",
    schema: z.object({ messages: z.string() }),
  }
);

// Generation setup
const GENERATION_PROMPT = `You are a writing agent. Respond with JSON containing generatedMessage and reasoning.`;

const analyzeStyleTool = tool(
  async ({ messages }: { messages: string }) => `Analyze: ${messages}`,
  {
    name: "analyze",
    description: "Analyze style",
    schema: z.object({ messages: z.string() }),
  }
);

// Node functions
async function summarizeNode(
  state: WorkflowStateType
): Promise<Partial<WorkflowStateType>> {
  const formattedMessages = state.savedMessages
    .map((m, i) => `[${i + 1}] ${m.title}: ${m.content}`)
    .join("\n\n");

  const agent = createAgent({
    model: new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
    }),
    tools: [summarizeTool],
    systemPrompt: SUMMARIZATION_PROMPT,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: `Summarize:\n\n${formattedMessages}` }],
  });

  const content = String(result.messages[result.messages.length - 1].content);
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { summary: parsed };
    }
  } catch {
    // ignore
  }

  return {
    summary: {
      summary: content.slice(0, 200),
      keyPoints: ["Parsed from response"],
      tone: "neutral",
    },
  };
}

async function evaluateNode(
  state: WorkflowStateType
): Promise<Partial<WorkflowStateType>> {
  if (!state.summary) return { shouldGenerate: false };

  const keyPointCount = state.summary.keyPoints.length;
  const summaryLength = state.summary.summary.length;
  const shouldGenerate = keyPointCount < 3 || summaryLength < 100;

  return { shouldGenerate };
}

async function generateNode(
  state: WorkflowStateType
): Promise<Partial<WorkflowStateType>> {
  const formattedMessages = state.savedMessages
    .map((m, i) => `[${i + 1}] ${m.title}: ${m.content}`)
    .join("\n\n");

  const agent = createDeepAgent({
    model: new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
    }),
    tools: [analyzeStyleTool],
    systemPrompt: GENERATION_PROMPT,
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `Based on:\n\n${formattedMessages}\n\nGenerate new content.`,
      },
    ],
  });

  const content = String(result.messages[result.messages.length - 1].content);
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { generatedContent: parsed };
    }
  } catch {
    // ignore
  }

  return {
    generatedContent: {
      generatedMessage: content.slice(0, 500),
      reasoning: "Generated from context",
    },
  };
}

function shouldGenerateEdge(state: WorkflowStateType): "generate" | "end" {
  return state.shouldGenerate ? "generate" : "end";
}

// Build workflow
const workflow = new StateGraph(WorkflowState)
  .addNode("summarize", summarizeNode)
  .addNode("evaluate", evaluateNode)
  .addNode("generate", generateNode)
  .addEdge(START, "summarize")
  .addEdge("summarize", "evaluate")
  .addConditionalEdges("evaluate", shouldGenerateEdge, {
    generate: "generate",
    end: END,
  })
  .addEdge("generate", END)
  .compile();

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    const result = await workflow.invoke({
      messages: [],
      savedMessages: messages,
      summary: null,
      shouldGenerate: false,
      generatedContent: null,
    });

    return NextResponse.json({
      summary: result.summary,
      decision: result.shouldGenerate ? "Generate" : "Stop",
      generatedMessage: result.generatedContent || undefined,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Workflow error details:", {
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
      { error: `Failed to run workflow: ${errorMessage}` },
      { status: 500 }
    );
  }
}
