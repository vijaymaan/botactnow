import OpenAI from "openai";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

/* =======================
   Types (TOP LEVEL ONLY)
   ======================= */

interface KBChunk {
  content: string;
}

/* =======================
   Azure AI Search Client
   ======================= */

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_ENDPOINT as string,
  process.env.AZURE_SEARCH_INDEX as string,
  new AzureKeyCredential(process.env.AZURE_SEARCH_KEY as string)
);

/* =======================
   Azure OpenAI Clients
   ======================= */

const embeddingClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBED_DEPLOYMENT}`,
  defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION }
});

const chatClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_CHAT_DEPLOYMENT}`,
  defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION }
});

/* =======================
   Embedding
   ======================= */

async function embed(text: string): Promise<number[]> {
  const response = await embeddingClient.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
}

/* =======================
   Vector Search
   ======================= */

async function retrieveChunks(
  query: string,
  vector: number[]
): Promise<string[]> {
  const results = await searchClient.search(query, {
    vectorSearchOptions: {
      queries: [
        {
          kind: "vector",
          vector,
          fields: ["contentVector"],
          kNearestNeighborsCount: 5
        }
      ]
    },
    select: ["content"],
    top: 5
  });

  const chunks: string[] = [];

  for await (const result of results.results) {
    const doc = result.document as KBChunk;
    if (doc && doc.content) {
      chunks.push(doc.content);
    }
  }

  return chunks;
}

/* =======================
   Chat Completion
   ======================= */

async function askLLM(
  question: string,
  chunks: string[]
): Promise<string> {
  const context = chunks.join("\n\n---\n\n");

  const response = await chatClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Answer ONLY using the provided context. If the answer is not present, say you do not know."
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion:\n${question}`
      }
    ]
  });

  return response.choices[0].message.content ?? "No answer found.";
}

/* =======================
   Public API for the Bot
   ======================= */

export async function handleUserQuestion(
  question: string
): Promise<string> {
  const vector = await embed(question);
  const chunks = await retrieveChunks(question, vector);
  return askLLM(question, chunks);
}
