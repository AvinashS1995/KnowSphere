import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, LoadingStateComponent],
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Welcome back, {{ userName }} 👋</h1>
          <p class="text-sm text-slate-500 mt-0.5">Your AI-powered knowledge assistant</p>
        </div>
        <select class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <!-- KPI Cards -->
      @if (loading()) {
        <app-loading-state type="card" [count]="4" />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          @for (kpi of kpis(); track kpi.label) {
            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-medium text-slate-500">{{ kpi.label }}</span>
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" [style.backgroundColor]="kpi.bgColor">
                  <mat-icon class="!text-base" [style.color]="kpi.iconColor">{{ kpi.icon }}</mat-icon>
                </div>
              </div>
              <div class="text-2xl font-bold text-slate-900 mb-1">{{ kpi.value }}</div>
              <div class="flex items-center gap-1 text-xs text-emerald-600">
                <mat-icon class="!text-xs">trending_up</mat-icon>
                {{ kpi.change }}
              </div>
            </div>
          }
        </div>
      }

      <!-- Quick Actions -->
      <div class="mb-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (action of quickActions; track action.label) {
            <a [routerLink]="action.route"
              class="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer block">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                [style.backgroundColor]="action.bgColor">
                <mat-icon [style.color]="action.iconColor">{{ action.icon }}</mat-icon>
              </div>
              <h3 class="text-sm font-semibold text-slate-800 mb-1">{{ action.label }}</h3>
              <p class="text-xs text-slate-400">{{ action.desc }}</p>
            </a>
          }
        </div>
      </div>

      <!-- Bottom row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Recent Documents (live) -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-700">Recent Documents</h2>
            <a routerLink="/documents" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View all →</a>
          </div>
          @if (docService.documents().length === 0 && !loading()) {
            <div class="flex flex-col items-center justify-center py-10 text-slate-400">
              <mat-icon class="!text-3xl mb-2">folder_open</mat-icon>
              <p class="text-sm">No documents yet</p>
              <a routerLink="/documents/upload" class="text-xs text-indigo-500 mt-1 hover:underline">Upload your first document</a>
            </div>
          } @else {
            <div class="divide-y divide-slate-50">
              @for (doc of recentDocs(); track doc.id) {
                <div class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    [style.backgroundColor]="getDocBg(doc.type)">
                    <mat-icon class="!text-base" [style.color]="getDocColor(doc.type)">{{ getDocIcon(doc.type) }}</mat-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-700 truncate">{{ doc.name }}</p>
                    <p class="text-xs text-slate-400">{{ doc.department }} · {{ doc.uploadedAt }}</p>
                  </div>
                  <span class="status-badge {{ doc.status }}">{{ doc.status }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Activity feed -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-700">Recent Activity</h2>
          </div>
          <div class="px-5 py-3 space-y-4">
            @for (a of activities; track a.text) {
              <div class="flex gap-3">
                <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  [style.backgroundColor]="a.bgColor">
                  <mat-icon class="!text-sm" [style.color]="a.iconColor">{{ a.icon }}</mat-icon>
                </div>
                <div>
                  <p class="text-xs font-medium text-slate-700 leading-snug">{{ a.text }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ a.time }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  docService = inject(DocumentService);
  analyticsService = inject(AnalyticsService);

  loading = signal(true);
  get userName() { return this.auth.currentUser()?.name?.split(' ')[0] ?? 'User'; }

  kpis = signal([
    { label: 'Total Documents', value: '—', change: 'Loading…', icon: 'folder', bgColor: '#ede9fe', iconColor: '#7c3aed' },
    { label: 'Conversations', value: '—', change: 'Loading…', icon: 'chat_bubble_outline', bgColor: '#dbeafe', iconColor: '#2563eb' },
    { label: 'Active Users', value: '—', change: 'Loading…', icon: 'group', bgColor: '#dcfce7', iconColor: '#16a34a' },
    { label: 'Avg. Response Time', value: '—', change: 'Loading…', icon: 'speed', bgColor: '#fef3c7', iconColor: '#d97706' }
  ]);

  recentDocs = computed(() => this.docService.documents().slice(0, 5));

  quickActions = [
    { label: 'Start Chat', desc: 'Ask a question', icon: 'chat_bubble_outline', route: '/chat', bgColor: '#ede9fe', iconColor: '#7c3aed' },
    { label: 'Upload Documents', desc: 'PDF, DOCX, XLSX…', icon: 'cloud_upload', route: '/documents/upload', bgColor: '#dbeafe', iconColor: '#2563eb' },
    { label: 'Browse Knowledge', desc: 'Explore documents', icon: 'auto_stories', route: '/knowledge-base', bgColor: '#dcfce7', iconColor: '#16a34a' },
    { label: 'View Analytics', desc: 'Usage & insights', icon: 'bar_chart', route: '/analytics', bgColor: '#fef3c7', iconColor: '#d97706' }
  ];

  activities = [
    { text: 'Document upload pipeline ready', time: 'Just now', icon: 'check_circle', bgColor: '#dcfce7', iconColor: '#16a34a' },
    { text: 'KnowSphere backend connected', time: 'Just now', icon: 'link', bgColor: '#ede9fe', iconColor: '#7c3aed' },
    { text: 'Vector DB initialised', time: 'On startup', icon: 'hub', bgColor: '#dbeafe', iconColor: '#2563eb' }
  ];

  ngOnInit(): void {
    // Load documents
    this.docService.getDocuments().subscribe({ error: () => {} });

    // Load analytics for KPIs
    this.analyticsService.getSummary().subscribe({
      next: data => {
        this.kpis.set([
          { label: 'Total Documents', value: String(data.topDocuments ?? 0), change: '↑ Live count', icon: 'folder', bgColor: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Conversations', value: String(data.totalQueries ?? 0), change: '↑ Total queries', icon: 'chat_bubble_outline', bgColor: '#dbeafe', iconColor: '#2563eb' },
          { label: 'Active Users', value: String(data.uniqueUsers ?? 0), change: '↑ Live count', icon: 'group', bgColor: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Avg. Response Time', value: data.avgResponseTime ?? '—', change: '↓ AI-powered', icon: 'speed', bgColor: '#fef3c7', iconColor: '#d97706' }
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getDocIcon(t: string) { return t === 'PDF' ? 'picture_as_pdf' : t === 'XLSX' ? 'table_chart' : 'description'; }
  getDocColor(t: string) { return t === 'PDF' ? '#dc2626' : t === 'XLSX' ? '#16a34a' : '#2563eb'; }
  getDocBg(t: string) { return t === 'PDF' ? '#fee2e2' : t === 'XLSX' ? '#dcfce7' : '#dbeafe'; }
}
