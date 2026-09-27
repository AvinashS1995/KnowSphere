import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'skeleton') {
      <div class="space-y-3 p-4">
        @for (row of rows; track $index) {
          <div class="animate-pulse flex space-x-4">
            @if (showAvatar) {
              <div class="rounded-full bg-slate-200 h-10 w-10 flex-shrink-0"></div>
            }
            <div class="flex-1 space-y-2 py-1">
              <div class="h-3 bg-slate-200 rounded w-3/4"></div>
              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        }
      </div>
    }
    @if (type === 'spinner') {
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }
    @if (type === 'card') {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        @for (card of rows; track $index) {
          <div class="animate-pulse bg-white rounded-xl border border-slate-200 p-5">
            <div class="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div class="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        }
      </div>
    }
  `
})
export class LoadingStateComponent {
  @Input() type: 'skeleton' | 'spinner' | 'card' = 'skeleton';
  @Input() count = 5;
  @Input() showAvatar = false;
  get rows(): number[] {
    return Array(this.count).fill(0);
  }
}
