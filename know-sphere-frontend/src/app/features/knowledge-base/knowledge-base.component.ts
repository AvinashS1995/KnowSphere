import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { KnowledgeBaseService } from '../../core/services/knowledge-base.service';
import { KnowledgeCollection } from '../../core/models/knowledge-base.model';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, LoadingStateComponent],
  template: `
    <div class="page-container">
      <div class="flex items-center justify-between mb-6">
        <div class="page-header mb-0">
          <h1>Knowledge Collections</h1>
          <p>Organize and explore your knowledge base</p>
        </div>
        <button mat-flat-button class="!bg-indigo-600 !text-white !rounded-lg !text-sm">
          <mat-icon class="!text-base mr-1">add</mat-icon> New Collection
        </button>
      </div>

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
                  <button mat-icon-button class="!w-7 !h-7 !text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <mat-icon class="!text-base">more_vert</mat-icon>
                  </button>
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
                  <button mat-stroked-button class="flex-1 !border-slate-200 !text-slate-600 !text-xs !rounded-lg !py-1">
                    <mat-icon class="!text-sm">search</mat-icon> Search
                  </button>
                  <a [routerLink]="['/search']" class="flex-1">
                    <button mat-flat-button class="w-full !text-xs !rounded-lg !py-1" [style.backgroundColor]="col.color + '15'" [style.color]="col.color">
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
  collections = signal<KnowledgeCollection[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.kbService.getCollections().subscribe(c => {
      this.collections.set(c);
      this.loading.set(false);
    });
  }
}
