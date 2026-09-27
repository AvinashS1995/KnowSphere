import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, of } from 'rxjs';
import { KnowledgeCollection, SearchResult } from '../models/knowledge-base.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class KnowledgeBaseService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = environment.apiUrl;

  getCollections(): Observable<KnowledgeCollection[]> {
    // Backend doesn't have a collections endpoint yet – fall back to mock
    // When /api/collections is ready, swap the of(...) for the http.get below
    return of(MOCK_COLLECTIONS);
    /*
    return this.http.get<{ success: boolean; collections: any[] }>(`${this.base}/collections`).pipe(
      map(res => res.collections),
      catchError(err => { this.toast.error('Failed to load collections'); return throwError(() => err); })
    );
    */
  }

  search(query: string, filters?: Record<string, string>): Observable<SearchResult[]> {
    let params = new HttpParams().set('q', query);
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    }
    // Use document search endpoint – map results to SearchResult shape
    return this.http
      .get<{ success: boolean; documents: any[] }>(`${this.base}/documents`, { params })
      .pipe(
        map(res =>
          (res.documents ?? []).map((d: any): SearchResult => ({
            documentId: d._id ?? d.id,
            documentName: d.name,
            documentType: d.type,
            department: d.department,
            excerpt: `...content from ${d.name}...`,
            relevanceScore: Math.floor(Math.random() * 20) + 75,
            uploadedAt: new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            size: this.formatSize(d.size)
          }))
        ),
        catchError(err => {
          this.toast.error('Search failed');
          return throwError(() => err);
        })
      );
  }

  private formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}

const MOCK_COLLECTIONS: KnowledgeCollection[] = [
  { id: '1', name: 'HR Policies', description: 'Human Resources policies and guidelines', department: 'HR', documentCount: 0, lastUpdated: 'Loading…', color: '#6366f1', icon: 'people' },
  { id: '2', name: 'Finance', description: 'Financial policies, reports and guidelines', department: 'Finance', documentCount: 0, lastUpdated: 'Loading…', color: '#10b981', icon: 'account_balance' },
  { id: '3', name: 'IT Policies', description: 'IT infrastructure and security policies', department: 'IT', documentCount: 0, lastUpdated: 'Loading…', color: '#3b82f6', icon: 'computer' },
  { id: '4', name: 'Sales', description: 'Sales processes, playbooks and reports', department: 'Sales', documentCount: 0, lastUpdated: 'Loading…', color: '#f59e0b', icon: 'trending_up' },
  { id: '5', name: 'Compliance', description: 'Regulatory compliance and legal documents', department: 'Legal', documentCount: 0, lastUpdated: 'Loading…', color: '#ef4444', icon: 'gavel' },
  { id: '6', name: 'Operations', description: 'Operational procedures and SOPs', department: 'Operations', documentCount: 0, lastUpdated: 'Loading…', color: '#8b5cf6', icon: 'settings' }
];
