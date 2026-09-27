import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { AnalyticsSummary } from '../models/analytics.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.apiUrl}/analytics`;

  getSummary(): Observable<AnalyticsSummary> {
    return this.http
      .get<{ success: boolean; data: AnalyticsSummary }>(`${this.base}/summary`)
      .pipe(
        map(res => res.data),
        catchError(err => {
          this.toast.error(err?.error?.message ?? 'Failed to load analytics');
          return throwError(() => err);
        })
      );
  }
}
