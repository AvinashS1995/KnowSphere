import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentService } from '../../core/services/document.service';
import { Document } from '../../core/models/document.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, EmptyStateComponent, LoadingStateComponent],
  template: `
    <div class="page-container">

      <!-- Page header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="page-header mb-0">
          <h1>Documents</h1>
          <p>Manage and organize your knowledge base</p>
        </div>
        <a routerLink="/documents/upload">
          <button mat-flat-button class="!bg-indigo-600 !text-white !rounded-lg !text-sm">
            <mat-icon class="!text-base mr-1">upload</mat-icon> Upload Documents
          </button>
        </a>
      </div>

      <!-- Tabs -->
      <div class="flex gap-0 mb-5 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        @for (tab of tabs; track tab.key) {
          <button
            (click)="activeTab.set(tab.key)"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            [class.bg-indigo-600]="activeTab() === tab.key"
            [class.text-white]="activeTab() === tab.key"
            [class.text-slate-600]="activeTab() !== tab.key"
            [class.hover:bg-slate-50]="activeTab() !== tab.key">
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Filters row -->
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex-1 min-w-48 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <mat-icon class="!text-sm text-slate-400">search</mat-icon>
          <input [(ngModel)]="searchQuery" placeholder="Search documents..."
            class="flex-1 text-sm text-slate-700 outline-none placeholder-slate-400 bg-transparent" />
        </div>
        <select [(ngModel)]="typeFilter"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Types</option>
          <option>PDF</option><option>DOCX</option><option>XLSX</option><option>TXT</option>
        </select>
        <select [(ngModel)]="deptFilter"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Departments</option>
          <option>HR</option><option>Finance</option><option>IT</option><option>Sales</option><option>Admin</option>
        </select>
      </div>

      <!-- Table -->
      @if (loading()) {
        <app-loading-state type="skeleton" [count]="6" />
      } @else if (filteredDocs().length === 0) {
        <app-empty-state
          icon="folder_open"
          title="No documents found"
          message="Upload your first document to get started."
          actionLabel="Upload Document"
          actionRoute="/documents/upload"
          actionIcon="upload" />
      } @else {
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-100 bg-slate-50">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Size</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Department</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Uploaded By</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (doc of filteredDocs(); track doc.id) {
                  <tr class="hover:bg-slate-50 transition-colors group">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          [style.backgroundColor]="getDocBg(doc.type)">
                          <mat-icon class="!text-base" [style.color]="getDocColor(doc.type)">{{ getDocIcon(doc.type) }}</mat-icon>
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-slate-700 truncate max-w-48">{{ doc.name }}</p>
                          <p class="text-xs text-slate-400 sm:hidden">{{ doc.sizeFormatted }} · {{ doc.type }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 hidden sm:table-cell">
                      <span class="type-badge {{ doc.type }}">{{ doc.type }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{{ doc.sizeFormatted }}</td>
                    <td class="px-4 py-3 hidden lg:table-cell">
                      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{{ doc.department }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">{{ doc.uploadedBy }}</td>
                    <td class="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{{ doc.uploadedAt }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-0.5">
                        <a [routerLink]="['/documents', doc.id]">
                          <button class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" matTooltip="View document">
                            <mat-icon class="!text-[16px]">visibility</mat-icon>
                          </button>
                        </a>
                        <button (click)="downloadDoc(doc)"
                          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" matTooltip="Download">
                          <mat-icon class="!text-[16px]">download</mat-icon>
                        </button>
                        <button (click)="toggleFav(doc.id)"
                          class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                          [class.text-yellow-500]="doc.isFavorite"
                          [class.text-slate-400]="!doc.isFavorite"
                          [class.hover:bg-yellow-50]="!doc.isFavorite"
                          [class.hover:text-yellow-600]="!doc.isFavorite"
                          [matTooltip]="doc.isFavorite ? 'Unfavorite' : 'Favorite'">
                          <mat-icon class="!text-[16px]">{{ doc.isFavorite ? 'star' : 'star_border' }}</mat-icon>
                        </button>
                        <button [matMenuTriggerFor]="docMenu"
                          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                          <mat-icon class="!text-[16px]">more_vert</mat-icon>
                        </button>
                        <mat-menu #docMenu="matMenu">
                          <button mat-menu-item (click)="archiveDoc(doc.id)">
                            <mat-icon>archive</mat-icon> Archive
                          </button>
                          <button mat-menu-item class="!text-red-500" (click)="deleteDoc(doc.id)">
                            <mat-icon class="!text-red-500">delete</mat-icon> Delete
                          </button>
                        </mat-menu>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <!-- Pagination hint -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Showing {{ filteredDocs().length }} of {{ docService.documents().length }} documents</span>
          </div>
        </div>
      }
    </div>
  `
})
export class DocumentsComponent implements OnInit {
  docService = inject(DocumentService);
  loading = signal(true);
  activeTab = signal('all');
  searchQuery = '';
  typeFilter = '';
  deptFilter = '';

  tabs = [
    { key: 'all', label: 'All Documents' },
    { key: 'recent', label: 'Recent' },
    { key: 'favorites', label: 'Favorites' },
    { key: 'archived', label: 'Archived' }
  ];

  filteredDocs = computed(() => {
    let docs = this.docService.documents();
    if (this.activeTab() === 'favorites') docs = docs.filter(d => d.isFavorite);
    if (this.activeTab() === 'archived') docs = docs.filter(d => d.isArchived);
    else if (this.activeTab() !== 'all') docs = docs.filter(d => !d.isArchived);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }
    if (this.typeFilter) docs = docs.filter(d => d.type === this.typeFilter);
    if (this.deptFilter) docs = docs.filter(d => d.department === this.deptFilter);
    return docs;
  });

  ngOnInit() {
    this.docService.getDocuments().subscribe({ error: () => this.loading.set(false) });
    setTimeout(() => this.loading.set(false), 1200);
  }

  toggleFav(id: string) { this.docService.toggleFavorite(id); }
  archiveDoc(id: string) { this.docService.archiveDocument(id); }
  deleteDoc(id: string) { this.docService.deleteDocument(id); }

  downloadDoc(doc: any): void {
    // Use presigned S3 URL if available, otherwise fetch from API
    this.docService.getDocument(doc.id).subscribe({
      next: fullDoc => {
        const url = (fullDoc as any).s3Url || (fullDoc as any).signedUrl;
        if (url) {
          const a = document.createElement('a');
          a.href = url;
          a.download = fullDoc.name;
          a.target = '_blank';
          a.click();
        }
      },
      error: () => {}
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
