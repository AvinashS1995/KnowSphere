import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, throwError } from 'rxjs';
import { Document, UploadProgress, DocumentStatus } from '../models/document.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

interface DocApiResponse { success: boolean; documents?: any[]; document?: any; }

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.apiUrl}/documents`;

  private _documents = signal<Document[]>([]);
  readonly documents = this._documents.asReadonly();

  private uploadsSubject = new BehaviorSubject<UploadProgress[]>([]);
  uploads$ = this.uploadsSubject.asObservable();

  // ── Fetch ──────────────────────────────────────────────────────────
  loadDocuments(params: Record<string, string> = {}): void {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${this.base}?${query}` : this.base;
    this.http.get<DocApiResponse>(url).subscribe({
      next: res => this._documents.set((res.documents ?? []).map(this.mapDoc)),
      error: err => this.toast.error(err?.error?.message ?? 'Failed to load documents')
    });
  }

  getDocuments(): Observable<Document[]> {
    return this.http.get<DocApiResponse>(this.base).pipe(
      map(res => (res.documents ?? []).map(this.mapDoc)),
      tap(docs => this._documents.set(docs)),
      catchError(err => { this.toast.error(err?.error?.message ?? 'Failed to load documents'); return throwError(() => err); })
    );
  }

  getDocument(id: string): Observable<Document> {
    return this.http.get<{ success: boolean; document: any }>(`${this.base}/${id}`).pipe(
      map(res => this.mapDoc(res.document)),
      catchError(err => throwError(() => err))
    );
  }

  // ── Upload with real progress ──────────────────────────────────────
  uploadFiles(files: File[], department = 'General', collectionId?: string): void {
    const uploads: UploadProgress[] = files.map(f => ({
      file: f, name: f.name, progress: 0, status: 'queued' as DocumentStatus
    }));
    this.uploadsSubject.next([...uploads]);

    files.forEach((file, idx) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('department', department);
      if (collectionId) formData.append('collectionId', collectionId);

      const req = new HttpRequest('POST', `${this.base}/upload`, formData, { reportProgress: true });

      uploads[idx].status = 'uploading';
      this.uploadsSubject.next([...uploads]);

      this.http.request(req).subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            uploads[idx].progress = Math.round(100 * event.loaded / event.total);
            this.uploadsSubject.next([...uploads]);
          } else if (event.type === HttpEventType.Response) {
            uploads[idx].progress = 100;
            uploads[idx].status = 'processing';
            this.uploadsSubject.next([...uploads]);
            // Poll status
            const body = event.body as { document?: any };
            if (body?.document?._id) {
              this.pollDocumentStatus(body.document._id, idx, uploads);
            }
          }
        },
        error: err => {
          uploads[idx].status = 'failed';
          uploads[idx].error = err?.error?.message ?? 'Upload failed';
          this.uploadsSubject.next([...uploads]);
          this.toast.error(`Failed to upload ${file.name}`);
        }
      });
    });
  }

  private pollDocumentStatus(docId: string, idx: number, uploads: UploadProgress[]): void {
    const interval = setInterval(() => {
      this.http.get<{ success: boolean; document: any }>(`${this.base}/${docId}`).subscribe({
        next: res => {
          const status = res.document?.status as DocumentStatus;
          uploads[idx].status = status;
          this.uploadsSubject.next([...uploads]);
          if (status === 'completed' || status === 'failed') {
            clearInterval(interval);
            if (status === 'completed') {
              this.toast.success(`${uploads[idx].name} processed successfully`);
              this.loadDocuments();
            } else {
              this.toast.error(`Processing failed for ${uploads[idx].name}`);
            }
          }
        },
        error: () => clearInterval(interval)
      });
    }, 3000);
  }

  // ── Mutations ──────────────────────────────────────────────────────
  toggleFavorite(id: string): void {
    this.http.patch<{ success: boolean; isFavorite: boolean }>(`${this.base}/${id}/favorite`, {}).subscribe({
      next: res => {
        this._documents.update(docs =>
          docs.map(d => d.id === id ? { ...d, isFavorite: res.isFavorite } : d)
        );
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to update favorite')
    });
  }

  archiveDocument(id: string): void {
    this.http.patch<{ success: boolean }>(`${this.base}/${id}/archive`, {}).subscribe({
      next: () => {
        this._documents.update(docs => docs.filter(d => d.id !== id));
        this.toast.success('Document archived');
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to archive')
    });
  }

  deleteDocument(id: string): void {
    this.http.delete<{ success: boolean }>(`${this.base}/${id}`).subscribe({
      next: () => {
        this._documents.update(docs => docs.filter(d => d.id !== id));
        this.toast.success('Document deleted');
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to delete')
    });
  }

  // ── Mapper ─────────────────────────────────────────────────────────
  private mapDoc = (d: any): Document => ({
    id: d._id ?? d.id,
    name: d.name ?? d.originalName,
    type: d.type,
    size: d.size,
    sizeFormatted: this.formatSize(d.size),
    department: d.department,
    uploadedBy: d.uploadedBy?.name ?? d.uploadedBy ?? 'Unknown',
    uploadedAt: new Date(d.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: d.status,
    s3Key: d.s3Key,
    s3Url: d.signedUrl ?? d.s3Url,
    pageCount: d.pageCount,
    chunkCount: d.chunkCount,
    collectionId: d.collectionId,
    isFavorite: d.isFavorite ?? false,
    isArchived: d.isArchived ?? false
  });

  private formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
