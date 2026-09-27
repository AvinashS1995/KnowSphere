import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { KnowledgeCollection } from '../../core/models/knowledge-base.model';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatButtonModule, LoadingStateComponent],
  styles: [`.ks-input{width:100%;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:13px;outline:none}.ks-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}`],
  template: `
    <div class="page-container">
      <div class="flex items-center justify-between mb-6">
        <div class="page-header mb-0">
          <h1>Knowledge Collections</h1>
          <p>Organize and explore your knowledge base</p>
        </div>
        <button mat-flat-button (click)="showNewForm.set(!showNewForm())"
          class="!bg-indigo-600 !text-white !rounded-lg !text-sm">
          <mat-icon class="!text-base mr-1">add</mat-icon> New Collection
        </button>
      </div>

      <!-- Inline create form -->
      @if (showNewForm()) {
        <div class="bg-white rounded-xl border border-indigo-200 shadow-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Create New Collection</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Name *</label>
              <input [(ngModel)]="newName" placeholder="e.g. HR Policies" class="ks-input" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Department</label>
              <select [(ngModel)]="newDept" class="ks-input">
                <option>HR</option><option>Finance</option><option>IT</option>
                <option>Sales</option><option>Legal</option><option>Operations</option><option>Admin</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Description</label>
              <input [(ngModel)]="newDesc" placeholder="Short description" class="ks-input" />
            </div>
            <div class="flex items-end gap-2">
              <button mat-flat-button (click)="createCollection()" [disabled]="!newName"
                class="flex-1 !bg-indigo-600 !text-white !rounded-lg !text-sm">Create</button>
              <button mat-stroked-button (click)="showNewForm.set(false)"
                class="!border-slate-200 !text-slate-600 !rounded-lg !text-sm">Cancel</button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <app-loading-state type="card" [count]="6" />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (col of collections(); track col.id) {
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer">
              <div class="p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                    [style.backgroundColor]="col.color + '20'">
                    <mat-icon [style.color]="col.color">{{ col.icon }}</mat-icon>
                  </div>
                  <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{{ col.department }}</span>
                </div>
                <h3 class="text-sm font-bold text-slate-800 mb-1">{{ col.name }}</h3>
                <p class="text-xs text-slate-400 mb-4 leading-relaxed">{{ col.description }}</p>
                <div class="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div class="flex items-center gap-1">
                    <mat-icon class="!text-xs text-slate-400">folder</mat-icon>
                    <span class="font-medium text-slate-700">{{ col.documentCount }}</span> documents
                  </div>
                  <span class="text-slate-400">{{ col.lastUpdated }}</span>
                </div>
              </div>
              <div class="px-5 pb-4">
                <div class="flex gap-2">
                  <a routerLink="/search" class="flex-1">
                    <button mat-stroked-button class="w-full !border-slate-200 !text-slate-600 !text-xs !rounded-lg">
                      <mat-icon class="!text-sm">search</mat-icon> Search
                    </button>
                  </a>
                  <a routerLink="/documents" class="flex-1">
                    <button mat-flat-button class="w-full !text-xs !rounded-lg"
                      [style.backgroundColor]="col.color + '15'" [style.color]="col.color">
                      Open →
                    </button>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class KnowledgeBaseComponent implements OnInit {
  private kbService = inject(KnowledgeBaseService);
  private docService = inject(DocumentService);

  collections = signal<KnowledgeCollection[]>([]);
  loading = signal(true);
  showNewForm = signal(false);
  newName = ''; newDept = 'HR'; newDesc = '';

  ngOnInit(): void {
    this.kbService.getCollections().subscribe(cols => {
      const docs = this.docService.documents();
      const enriched = cols.map(c => ({
        ...c,
        documentCount: docs.filter(d => d.department === c.department).length || c.documentCount,
        lastUpdated: docs.filter(d => d.department === c.department).length > 0
          ? docs.filter(d => d.department === c.department)[0].uploadedAt
          : c.lastUpdated
      }));
      this.collections.set(enriched);
      this.loading.set(false);
    });
    this.docService.getDocuments().subscribe();
  }

  createCollection(): void {
    if (!this.newName.trim()) return;
    const colorMap: Record<string, string> = { HR: '#6366f1', Finance: '#10b981', IT: '#3b82f6', Sales: '#f59e0b', Legal: '#ef4444', Operations: '#8b5cf6', Admin: '#06b6d4' };
    const iconMap: Record<string, string> = { HR: 'people', Finance: 'account_balance', IT: 'computer', Sales: 'trending_up', Legal: 'gavel', Operations: 'settings', Admin: 'admin_panel_settings' };
    this.collections.update(c => [{
      id: Date.now().toString(),
      name: this.newName, description: this.newDesc || `${this.newName} documents`,
      department: this.newDept, documentCount: 0, lastUpdated: 'Just now',
      color: colorMap[this.newDept] || '#6366f1', icon: iconMap[this.newDept] || 'folder'
    }, ...c]);
    this.newName = ''; this.newDesc = '';
    this.showNewForm.set(false);
  }
}
