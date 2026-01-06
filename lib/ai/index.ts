/**
 * AI Services for Saved Messages (Client-side)
 * Calls server-side API routes
 */

export interface SummaryOutput {
  summary: string;
  keyPoints: string[];
  tone: string;
}

export interface GenerationOutput {
  generatedMessage: string;
  reasoning: string;
}

export interface WorkflowResult {
  summary: SummaryOutput;
  decision: "Generate" | "Stop";
  generatedMessage?: GenerationOutput;
}

/**
 * Summarize saved messages using LangChain (via API)
 */
export async function summarizeSavedMessages(
  messages: Array<{ title: string; content: string }>
): Promise<SummaryOutput> {
  const response = await fetch("/api/ai/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Failed to summarize messages");
  }

  return response.json();
}

/**
 * Generate new content using Deep Agents (via API)
 */
export async function generateNewContent(
  messages: Array<{ title: string; content: string }>,
  intent: string
): Promise<GenerationOutput> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, intent }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate content");
  }

  return response.json();
}

/**
 * Run the complete workflow using LangGraph (via API)
 */
export async function runSavedMessagesWorkflow(
  messages: Array<{ title: string; content: string }>
): Promise<WorkflowResult> {
  const response = await fetch("/api/ai/workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Failed to run workflow");
  }

  return response.json();
}
