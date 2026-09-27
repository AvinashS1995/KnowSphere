import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError, of } from 'rxjs';
import { AppSettings } from '../models/settings.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.apiUrl}/settings`;

  private _settings = signal<AppSettings>(DEFAULT_SETTINGS);
  readonly settings = this._settings.asReadonly();

  getSettings(): Observable<AppSettings> {
    return this.http
      .get<{ success: boolean; settings: AppSettings }>(this.base)
      .pipe(
        tap(res => {
          if (res?.settings) {
            this._settings.set({ ...DEFAULT_SETTINGS, ...res.settings });
          }
        }),
        // Return the inner settings object, not the wrapper
        map(res => ({ ...DEFAULT_SETTINGS, ...(res?.settings ?? {}) })),
        catchError(() => of(DEFAULT_SETTINGS))
      );
  }

  saveSettings(settings: AppSettings): Observable<{ success: boolean; message: string }> {
    const safe = JSON.parse(JSON.stringify(settings));
    if (safe.ai) { delete safe.ai.apiKey; }
    if (safe.vectorDB) { delete safe.vectorDB.apiKey; }

    return this.http
      .put<{ success: boolean; settings: AppSettings; message: string }>(this.base, safe)
      .pipe(
        tap(res => {
          if (res?.settings) {
            this._settings.set({ ...DEFAULT_SETTINGS, ...res.settings });
          }
          this.toast.success(res.message ?? 'Settings saved successfully');
        }),
        map(res => ({ success: res.success, message: res.message })),
        catchError(err => {
          this.toast.error(err?.error?.message ?? 'Failed to save settings');
          return throwError(() => err);
        })
      );
  }

  /** Get current AI provider – used by chat to show active model */
  get currentAIProvider(): string { return this._settings().ai.provider; }
  get currentAIModel(): string { return this._settings().ai.model; }
}

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'KnowSphere',
  timezone: 'Asia/Kolkata',
  language: 'en',
  ai: { provider: 'openai', model: 'gpt-4o', temperature: 0.2, maxTokens: 2000 },
  vectorDB: { provider: 'qdrant', url: 'http://localhost:6333', collection: 'knowledge-base' },
  documentProcessing: { chunkSize: 1000, chunkOverlap: 150, topK: 5, minRelevanceScore: 0.7 },
  security: { sessionTimeout: 30, mfaEnabled: false, allowedDomains: ['company.com'] },
  notifications: { emailNotifications: true, processingComplete: true, queryAlerts: false, weeklyReport: true }
};
