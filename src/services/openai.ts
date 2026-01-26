import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_KEY!;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;

const client = new OpenAI({
  apiKey,
  baseURL: `${endpoint}/openai/deployments/${deployment}`,
  defaultHeaders: {
    "api-key": apiKey
  },
  defaultQuery: {
    "api-version": "2024-02-15-preview"
  }
});

export async function askOpenAI({
  question,
  context
}: {
  question: string;
  context: string | null;
}): Promise<string> {
  const messages: ChatCompletionMessageParam[] = context
    ? [
        {
          role: "system",
          content:
            "You are a helpful assistant. Answer ONLY using the provided context."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${question}`
        }
      ]
    : [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: question
        }
      ];

  const response = await client.chat.completions.create({
    model: deployment,
    messages,
    temperature: 0.3
  });

  return response.choices[0]?.message?.content ?? "I don't know";
}
