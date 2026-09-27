import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
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
    // /api/settings not yet implemented on backend – return defaults
    // When ready: return this.http.get<AppSettings>(this.base).pipe(tap(s => this._settings.set(s)));
    return of(DEFAULT_SETTINGS).pipe(tap(s => this._settings.set(s)));
  }

  saveSettings(settings: AppSettings): Observable<void> {
    this._settings.set(settings);
    // When backend ready: return this.http.put<void>(this.base, settings).pipe(tap(() => this.toast.success('Settings saved')));
    this.toast.success('Settings saved successfully');
    return of(undefined);
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'KnowSphere',
  timezone: 'Asia/Kolkata',
  language: 'en',
  ai: { provider: 'openai', model: 'gpt-4o', temperature: 0.2, maxTokens: 2000 },
  vectorDB: { provider: 'qdrant', url: 'http://localhost:6333', collection: 'knowledge-base' },
  documentProcessing: { chunkSize: 1000, chunkOverlap: 150, topK: 5, minRelevanceScore: 0.7 },
  security: { sessionTimeout: 30, mfaEnabled: false, allowedDomains: ['company.com'] },
  notifications: { emailNotifications: true, processingComplete: true, queryAlerts: false, weeklyReport: true }
};
