import { v4 as uuidv4 } from 'uuid';
import { getAIProvider } from '../ai/ai-provider.factory';
import { VectorStoreService } from '../vector/vector-store.service';
import { config } from '../config/env';

export interface RAGSource {
  documentId: string;
  documentName: string;
  documentType: string;
  pageRange: string;
  excerpt: string;
  relevanceScore: number;
}

export interface RAGResult {
  answer: string;
  sources: RAGSource[];
}

const vectorStore = new VectorStoreService();

/**
 * Full RAG pipeline:
 * Question → Embed → Search Qdrant → Build context → LLM → Answer + Sources
 */
export async function ragQuery(question: string, collectionId?: string): Promise<RAGResult> {
  const aiProvider = getAIProvider();

  // 1. Embed the query
  const { embedding: queryVector } = await aiProvider.embed(question);

  // 2. Search vector store
  const filter = collectionId ? { must: [{ key: 'collectionId', match: { value: collectionId } }] } : undefined;
  const searchResults = await vectorStore.search(queryVector, config.processing.topK, filter);

  if (!searchResults.length) {
    return {
      answer: "I couldn't find sufficient information in the available knowledge base to answer your question.",
      sources: []
    };
  }

  // 3. Build context from retrieved chunks
  const contextParts = searchResults.map((r, i) => {
    const p = r.payload;
    return `[Source ${i + 1}] ${p['documentName']} (${p['pageRange'] || ''})\n${p['content']}`;
  });
  const context = contextParts.join('\n\n---\n\n');

  // 4. Build prompt
  const systemPrompt = `You are KnowSphere, an enterprise knowledge assistant.
Answer questions based ONLY on the provided context documents.
If the information is not in the context, say "I couldn't find sufficient information in the available knowledge base."
Always be professional, concise, and cite sources by their source number.
Format responses with numbered lists when appropriate.`;

  const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

  // 5. Get LLM answer
  const { content: answer } = await aiProvider.complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    { temperature: config.ai.temperature, maxTokens: config.ai.maxTokens }
  );

  // 6. Build source citations
  const sources: RAGSource[] = searchResults.map(r => ({
    documentId: String(r.payload['documentId'] || ''),
    documentName: String(r.payload['documentName'] || ''),
    documentType: String(r.payload['documentType'] || ''),
    pageRange: String(r.payload['pageRange'] || ''),
    excerpt: String(r.payload['content'] || '').slice(0, 200),
    relevanceScore: Math.round(r.score * 100)
  }));

  return { answer, sources };
}

/**
 * Store document chunks in vector DB after processing.
 */
export async function storeDocumentChunks(
  documentId: string,
  documentName: string,
  documentType: string,
  collectionId: string | undefined,
  chunks: Array<{ content: string; index: number }>
): Promise<number> {
  const aiProvider = getAIProvider();
  const points = [];

  for (const chunk of chunks) {
    try {
      const { embedding } = await aiProvider.embed(chunk.content);
      points.push({
        id: uuidv4(),
        vector: embedding,
        payload: {
          documentId,
          documentName,
          documentType,
          collectionId: collectionId || '',
          content: chunk.content,
          chunkIndex: chunk.index,
          pageRange: `Chunk ${chunk.index + 1}`
        }
      });
    } catch (err) {
      console.error(`Embedding error for chunk ${chunk.index}:`, err);
    }
  }

  if (points.length) await vectorStore.upsert(points);
  return points.length;
}
