import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Source } from '../../../core/models/chat.model';

@Component({
  selector: 'app-source-citation',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="mt-3">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sources</p>
      <div class="flex flex-wrap gap-2">
        @for (source of sources; track source.documentId) {
          <button
            (click)="openSource.emit(source)"
            class="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-colors group">
            <mat-icon class="!text-base text-indigo-500 flex-shrink-0">
              {{ getIcon(source.documentType) }}
            </mat-icon>
            <div>
              <p class="text-xs font-medium text-slate-700 group-hover:text-indigo-700 leading-tight">{{ source.documentName }}</p>
              <p class="text-xs text-slate-400">{{ source.pageRange }}</p>
            </div>
          </button>
        }
      </div>
    </div>
  `
})
export class SourceCitationComponent {
  @Input() sources: Source[] = [];
  @Output() openSource = new EventEmitter<Source>();

  getIcon(type: string): string {
    const t = type?.toUpperCase();
    if (t === 'PDF') return 'picture_as_pdf';
    if (t === 'XLSX') return 'table_chart';
    if (t === 'DOCX') return 'description';
    return 'insert_drive_file';
  }
}
