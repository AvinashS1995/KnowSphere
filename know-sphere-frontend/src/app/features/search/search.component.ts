import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { SearchResult } from '../../core/models/knowledge-base.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container">
      <div class="page-header mb-6">
        <h1>Search Documents</h1>
        <p>Find relevant documents using AI-powered semantic search</p>
      </div>

      <!-- Search bar -->
      <div class="flex gap-3 mb-5">
        <div class="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <mat-icon class="text-slate-400">search</mat-icon>
          <input
            [(ngModel)]="query"
            (keydown.enter)="doSearch()"
            placeholder="employee leave policy..."
            class="flex-1 text-sm text-slate-700 outline-none placeholder-slate-400 bg-transparent" />
          @if (query) {
            <button (click)="query = ''; results.set([])" class="text-slate-400 hover:text-slate-600">
              <mat-icon class="!text-base">close</mat-icon>
            </button>
          }
        </div>
        <button mat-flat-button (click)="doSearch()" [disabled]="!query.trim()"
          class="!bg-indigo-600 !text-white !rounded-xl !px-6 !text-sm">
          Search
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <select [(ngModel)]="typeFilter"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Document Type</option>
          <option>PDF</option><option>DOCX</option><option>XLSX</option>
        </select>
        <select [(ngModel)]="deptFilter"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Department</option>
          <option>HR</option><option>Finance</option><option>IT</option><option>Sales</option>
        </select>
        <div class="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <mat-icon class="!text-base text-slate-400">calendar_today</mat-icon>
          <span class="text-sm text-slate-500">Date Range</span>
        </div>
        <button class="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
          <mat-icon class="!text-base">tune</mat-icon> More Filters
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center gap-3 text-sm text-slate-500 py-8">
          <div class="w-5 h-5 border-2 border-indigo-400 border-t-indigo-700 rounded-full animate-spin"></div>
          Searching knowledge base...
        </div>
      }

      <!-- Results -->
      @if (!loading() && results().length) {
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-slate-600">Search Results ({{ results().length }})</p>
          <select class="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none">
            <option>Relevance</option><option>Date</option><option>Name</option>
          </select>
        </div>

        <div class="space-y-3">
          @for (result of results(); track result.documentId) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 cursor-pointer group">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    [style.backgroundColor]="getDocBg(result.documentType)">
                    <mat-icon class="!text-base" [style.color]="getDocColor(result.documentType)">
                      {{ getDocIcon(result.documentType) }}
                    </mat-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <h3 class="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {{ result.documentName }}
                      </h3>
                      <span class="type-badge {{ result.documentType }}">{{ result.documentType }}</span>
                      <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{{ result.department }}</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-2">
                      <span class="font-medium">Relevant passage: </span>
                      <span class="italic">"{{ result.excerpt }}"</span>
                    </p>
                    <div class="flex items-center gap-3 text-xs text-slate-400">
                      <span>{{ result.size }}</span>
                      <span>·</span>
                      <span>Updated {{ result.uploadedAt }}</span>
                      @if (result.pageNumber) {
                        <span>·</span>
                        <span>Page {{ result.pageNumber }}</span>
                      }
                    </div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1 flex-shrink-0">
                  <div class="flex items-center gap-1">
                    <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="result.relevanceScore"></div>
                    </div>
                    <span class="text-xs font-semibold text-emerald-600">{{ result.relevanceScore }}%</span>
                  </div>
                  <span class="text-xs text-slate-400">Relevance</span>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && !results().length && hasSearched()) {
        <div class="text-center py-16">
          <mat-icon class="!text-4xl text-slate-300 mb-3 block">search_off</mat-icon>
          <h3 class="text-sm font-semibold text-slate-600 mb-1">No results found</h3>
          <p class="text-xs text-slate-400">Try different keywords or adjust your filters</p>
        </div>
      }

      <!-- Initial state -->
      @if (!loading() && !hasSearched()) {
        <div class="text-center py-16">
          <mat-icon class="!text-5xl text-slate-200 mb-4 block">manage_search</mat-icon>
          <h3 class="text-sm font-semibold text-slate-500 mb-1">AI-Powered Semantic Search</h3>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">Enter a query to find semantically relevant documents from your knowledge base.</p>
        </div>
      }
    </div>
  `
})
export class SearchComponent {
  private kbService = inject(KnowledgeBaseService);
  query = '';
  typeFilter = '';
  deptFilter = '';
  results = signal<SearchResult[]>([]);
  loading = signal(false);
  hasSearched = signal(false);

  doSearch(): void {
    if (!this.query.trim()) return;
    this.loading.set(true);
    this.hasSearched.set(true);
    this.kbService.search(this.query).subscribe(r => {
      this.results.set(r);
      this.loading.set(false);
    });
  }

  getDocIcon(type: string): string {
    if (type === 'PDF') return 'picture_as_pdf';
    if (type === 'XLSX') return 'table_chart';
    return 'description';
  }
  getDocColor(type: string): string {
    if (type === 'PDF') return '#dc2626';
    if (type === 'XLSX') return '#16a34a';
    return '#2563eb';
  }
  getDocBg(type: string): string {
    if (type === 'PDF') return '#fee2e2';
    if (type === 'XLSX') return '#dcfce7';
    return '#dbeafe';
  }
}
