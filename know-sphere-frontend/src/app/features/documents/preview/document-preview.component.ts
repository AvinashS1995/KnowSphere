import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentService } from '../../../core/services/document.service';
import { Document } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="flex h-[calc(100vh-64px)]">

      <!-- Thumbnail sidebar -->
      <div class="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-3 overflow-y-auto flex-shrink-0">
        @for (page of pages; track page; let i = $index) {
          <button
            (click)="currentPage.set(i + 1)"
            class="w-14 aspect-[3/4] rounded border-2 transition-colors flex items-center justify-center text-xs font-medium flex-shrink-0"
            [class.border-indigo-500]="currentPage() === i + 1"
            [class.border-slate-200]="currentPage() !== i + 1"
            [class.bg-indigo-50]="currentPage() === i + 1"
            [class.bg-slate-50]="currentPage() !== i + 1"
            [class.text-indigo-700]="currentPage() === i + 1"
            [class.text-slate-400]="currentPage() !== i + 1">
            {{ i + 1 }}
          </button>
        }
      </div>

      <!-- Main preview -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Toolbar -->
        <div class="h-12 bg-white border-b border-slate-200 flex items-center gap-3 px-4 flex-shrink-0">
          <a routerLink="/documents">
            <button mat-icon-button class="!text-slate-500">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </a>
          <span class="text-sm font-medium text-slate-700 flex-1 truncate">{{ doc()?.name }}</span>
          <div class="flex items-center gap-1 text-sm text-slate-600">
            <button mat-icon-button class="!w-7 !h-7" (click)="prevPage()" [disabled]="currentPage() === 1">
              <mat-icon class="!text-base">chevron_left</mat-icon>
            </button>
            <span class="text-xs">{{ currentPage() }} / {{ totalPages() }}</span>
            <button mat-icon-button class="!w-7 !h-7" (click)="nextPage()" [disabled]="currentPage() === totalPages()">
              <mat-icon class="!text-base">chevron_right</mat-icon>
            </button>
          </div>
          <div class="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button mat-icon-button class="!w-7 !h-7 text-slate-500" (click)="zoom(-10)">
              <mat-icon class="!text-base">remove</mat-icon>
            </button>
            <span class="text-xs text-slate-600 w-12 text-center">{{ zoomLevel() }}%</span>
            <button mat-icon-button class="!w-7 !h-7 text-slate-500" (click)="zoom(10)">
              <mat-icon class="!text-base">add</mat-icon>
            </button>
          </div>
          <button mat-icon-button matTooltip="Download" class="!text-slate-500">
            <mat-icon>download</mat-icon>
          </button>
        </div>

        <!-- Document content area -->
        <div class="flex-1 overflow-auto bg-slate-200 flex items-start justify-center p-6">
          <div
            class="bg-white shadow-lg rounded transition-all origin-top"
            [style.width.px]="600 * zoomLevel() / 100"
            [style.min-height.px]="800 * zoomLevel() / 100">
            <div class="p-10" [style.fontSize.px]="14 * zoomLevel() / 100">
              <h2 class="font-bold text-slate-900 mb-4">{{ doc()?.name }}</h2>
              <p class="text-slate-600 leading-relaxed mb-4">
                Page {{ currentPage() }} of {{ totalPages() }}
              </p>
              <div class="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  The employee increment process is carried out annually based on performance review, market conditions and business requirements.
                </p>
                <p><strong>Steps:</strong></p>
                <ol class="list-decimal pl-5 space-y-2">
                  <li>Based on the HR policy document, the performance review</li>
                  <li>HR approval</li>
                  <li>Generation of increment letter and annexure</li>
                  <li>Communication to employee</li>
                  <li>Effective from the mentioned date</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right info panel -->
      <div class="w-64 bg-white border-l border-slate-200 flex flex-col flex-shrink-0 hidden xl:flex">
        <div class="px-4 py-4 border-b border-slate-100">
          <h3 class="text-sm font-semibold text-slate-700">Document Details</h3>
        </div>
        <div class="p-4 space-y-4 flex-1 overflow-y-auto">
          @if (doc()) {
            @for (info of docInfo(); track info.label) {
              <div>
                <p class="text-xs text-slate-400 mb-1">{{ info.label }}</p>
                <p class="text-sm font-medium text-slate-700">{{ info.value }}</p>
              </div>
            }
          }
        </div>
        <div class="p-4 border-t border-slate-100">
          <div class="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
            <mat-icon class="!text-sm">check_circle</mat-icon>
            <span>Processed & Indexed</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DocumentPreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private docService = inject(DocumentService);

  doc = signal<Document | undefined>(undefined);
  currentPage = signal(1);
  zoomLevel = signal(100);

  get pages(): number[] {
    return Array(this.totalPages()).fill(0);
  }

  totalPages(): number { return this.doc()?.pageCount ?? 1; }

  docInfo = () => {
    const d = this.doc();
    if (!d) return [];
    return [
      { label: 'Name', value: d.name },
      { label: 'Type', value: d.type },
      { label: 'Size', value: d.sizeFormatted },
      { label: 'Department', value: d.department },
      { label: 'Uploaded By', value: d.uploadedBy },
      { label: 'Uploaded Date', value: d.uploadedAt },
      { label: 'Pages', value: String(d.pageCount) },
      { label: 'Chunks', value: String(d.chunkCount) }
    ];
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.docService.getDocument(id).subscribe({
        next: d => this.doc.set(d),
        error: () => {}
      });
    }
  }

  prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  zoom(delta: number): void {
    const next = this.zoomLevel() + delta;
    if (next >= 50 && next <= 200) this.zoomLevel.set(next);
  }
}
