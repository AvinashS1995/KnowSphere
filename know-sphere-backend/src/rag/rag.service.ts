import { v4 as uuidv4 } from 'uuid';
import { getAIProvider } from '../ai/ai-provider.factory';
import { VectorStoreService } from '../vector/vector-store.service';
import { config } from '../config/env';
import { SettingsModel } from '../models/settings.model';

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
 * Full RAG pipeline with graceful fallback:
 *
 * 1. Try to embed question + search Qdrant
 * 2. If vectors found → use RAG context + LLM
 * 3. If no vectors (no docs uploaded yet) → direct LLM answer
 * 4. If embed fails (bad API key / no quota) → direct LLM answer with notice
 */
export async function ragQuery(question: string, collectionId?: string): Promise<RAGResult> {
  const aiProvider = getAIProvider();

  // Load active AI settings from DB for temperature/maxTokens
  let temperature = config.ai.temperature;
  let maxTokens = config.ai.maxTokens;
  try {
    const settings = await SettingsModel.findOne({ workspaceId: 'default' }).lean();
    if (settings?.ai) {
      temperature = settings.ai.temperature ?? temperature;
      maxTokens = settings.ai.maxTokens ?? maxTokens;
    }
  } catch {}

  let searchResults: any[] = [];
  let embeddingAvailable = true;

  // Step 1 — Try embedding + vector search
  try {
    const { embedding: queryVector } = await aiProvider.embed(question);
    if (queryVector.length > 0) {
      const filter = collectionId
        ? { must: [{ key: 'collectionId', match: { value: collectionId } }] }
        : undefined;
      searchResults = await vectorStore.search(queryVector, config.processing.topK, filter);
    }
  } catch (embedErr: any) {
    embeddingAvailable = false;
    // Safe log — no secrets
    console.warn(`⚠️  Embedding unavailable (${aiProvider.name}): ${embedErr?.message?.slice(0, 100)}`);
  }

  // Step 2 — Build system prompt
  const systemPrompt = `You are KnowSphere, a helpful enterprise AI knowledge assistant.
Be professional, concise, and accurate.
If you are answering from document context, cite sources.
If you have no context, answer from your general knowledge but clearly state the information is not from uploaded documents.`;

  let userPrompt: string;
  let sources: RAGSource[] = [];

  if (searchResults.length > 0) {
    // ── RAG path: use retrieved context ──────────────────────────────────
    const contextParts = searchResults.map((r, i) => {
      const p = r.payload;
      return `[Source ${i + 1}] ${p['documentName']} (${p['pageRange'] || ''})\n${p['content']}`;
    });
    const context = contextParts.join('\n\n---\n\n');

    userPrompt = `Context from knowledge base:\n\n${context}\n\nQuestion: ${question}\n\nAnswer based only on the context above:`;

    sources = searchResults.map(r => ({
      documentId:   String(r.payload['documentId']   || ''),
      documentName: String(r.payload['documentName'] || ''),
      documentType: String(r.payload['documentType'] || ''),
      pageRange:    String(r.payload['pageRange']    || ''),
      excerpt:      String(r.payload['content']      || '').slice(0, 200),
      relevanceScore: Math.round((r.score ?? 0) * 100)
    }));

  } else if (!embeddingAvailable) {
    // ── Fallback: embedding failed, direct LLM ────────────────────────────
    userPrompt = `${question}\n\n(Note: Document search is unavailable at the moment. Answering from general knowledge.)`;

  } else {
    // ── No documents in knowledge base yet ───────────────────────────────
    userPrompt = question;
  }

  // Step 3 — Call LLM
  try {
    const { content: answer } = await aiProvider.complete(
      [
        { role: 'system',  content: systemPrompt },
        { role: 'user',    content: userPrompt }
      ],
      { temperature, maxTokens }
    );

    return {
      answer: answer || "I couldn't generate a response. Please try again.",
      sources
    };

  } catch (llmErr: any) {
    const msg = llmErr?.message || '';
    // Return a friendly error that doesn't leak the API key error details
    if (msg.includes('API key') || msg.includes('INVALID_ARGUMENT') || msg.includes('401')) {
      return {
        answer: `⚠️ The AI provider (${aiProvider.name}) is not properly configured. Please ask your admin to check the API key in the backend .env file.`,
        sources: []
      };
    }
    if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return {
        answer: `⚠️ The AI provider quota has been exceeded. Please try again later or switch to a different model in Settings.`,
        sources: []
      };
    }
    console.error(`LLM error (${aiProvider.name}):`, msg.slice(0, 200));
    return {
      answer: "I couldn't generate a response right now. Please try again.",
      sources: []
    };
  }
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
      if (!embedding?.length) continue;
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
    } catch (err: any) {
      console.error(`Embedding error for chunk ${chunk.index}:`, err?.message?.slice(0, 100));
    }
  }

  if (points.length) await vectorStore.upsert(points);
  return points.length;
}
