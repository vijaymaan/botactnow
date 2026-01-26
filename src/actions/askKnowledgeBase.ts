import { searchKnowledgeBase } from "../services/search";
import { askOpenAI } from "../services/openai";

export async function askKnowledgeBase(question: string): Promise<string> {
  // 1. Search KB
  const docs = await searchKnowledgeBase(question);

  // 2. Use KB ONLY if there is meaningful content
  if (docs.length > 0 && docs[0].score !== undefined && docs[0].score > 0.25) {
    return await askOpenAI({
      question,
      context: docs.map(d => d.content).join("\n")
    });
  }

  // 3. ALWAYS fall back to generic OpenAI
  return await askOpenAI({
    question,
    context: null
  });
}
