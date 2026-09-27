import { config } from '../config/env';

export interface VectorPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

/**
 * VectorStoreService – wraps Qdrant REST API.
 * Provides upsert and similarity search operations.
 */
export class VectorStoreService {
  private baseUrl: string;
  private headers: Record<string, string>;
  private collection: string;

  constructor() {
    this.baseUrl = config.qdrant.url;
    this.collection = config.qdrant.collection;
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.qdrant.apiKey ? { 'api-key': config.qdrant.apiKey } : {})
    };
  }

  async ensureCollection(vectorSize = 1536): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/collections/${this.collection}`, { headers: this.headers });
      if (res.status === 200) return;

      await fetch(`${this.baseUrl}/collections/${this.collection}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          vectors: { size: vectorSize, distance: 'Cosine' }
        })
      });
      console.log(`✅ Qdrant collection created: ${this.collection}`);
    } catch (err) {
      console.warn('⚠️  Qdrant not reachable – vector operations will be skipped:', (err as Error).message);
    }
  }

  async upsert(points: VectorPoint[]): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/collections/${this.collection}/points`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ points })
      });
    } catch (err) {
      console.warn('⚠️  Qdrant upsert failed:', (err as Error).message);
    }
  }

  async search(vector: number[], topK: number, filter?: Record<string, unknown>): Promise<SearchResult[]> {
    try {
      const body: Record<string, unknown> = { vector, top: topK, with_payload: true };
      if (filter) body.filter = filter;

      const res = await fetch(`${this.baseUrl}/collections/${this.collection}/points/search`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body)
      });

      if (!res.ok) return [];
      const data = await res.json() as { result: SearchResult[] };
      return data.result || [];
    } catch {
      return [];
    }
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/collections/${this.collection}/points/delete`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ filter: { must: [{ key: 'documentId', match: { value: documentId } }] } })
      });
    } catch {}
  }
}
