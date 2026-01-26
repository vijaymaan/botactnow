import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const endpoint = process.env.AZURE_SEARCH_ENDPOINT!;
const apiKey = process.env.AZURE_SEARCH_KEY!;
const indexName = process.env.AZURE_SEARCH_INDEX!;

export interface KnowledgeBaseDocument {
  content: string;
  score?: number;
}

const client = new SearchClient(
  endpoint,
  indexName,
  new AzureKeyCredential(apiKey)
);

export async function searchKnowledgeBase(
  query: string
): Promise<KnowledgeBaseDocument[]> {
  if (!query) return [];

  const results: KnowledgeBaseDocument[] = [];

  const response = await client.search(query, {
    top: 5,
    queryType: "semantic",
    semanticSearchOptions: {
      configurationName: "default"
    },
    select: ["content"]
  });

  for await (const item of response.results) {
    const doc = item.document as any;
    if (doc?.content) {
      results.push({
        content: doc.content,
        score: item.score
      });
    }
  }

  return results;
}
