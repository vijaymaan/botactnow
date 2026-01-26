import { searchKnowledgeBase } from "../services/search";
import { askOpenAI } from "../services/openai";

export async function askKnowledgeBase(question: string) {
  // 1. Search KB
  const documents = await searchKnowledgeBase(question);

  // 2. If KB has results → RAG answer
  if (documents.length > 0) {
    return await askOpenAI({
      question,
      context: documents.map(d => d.content).join("\n")
    });
  }

  // 3. No KB match → generic answer
  return await askOpenAI({
    question,
    context: null
  });
}
