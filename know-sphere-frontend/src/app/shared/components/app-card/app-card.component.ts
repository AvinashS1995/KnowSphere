import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-xl border border-slate-200 p-5"
      [class.shadow-sm]="shadow"
      [class.hover:shadow-md]="hoverable"
      [class.cursor-pointer]="hoverable"
      [class.transition-shadow]="hoverable"
      [ngClass]="extraClass">
      @if (title) {
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-slate-700">{{ title }}</h3>
          <ng-content select="[card-action]"></ng-content>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class AppCardComponent {
  @Input() title = '';
  @Input() shadow = true;
  @Input() hoverable = false;
  @Input() extraClass = '';
}
