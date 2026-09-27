import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <mat-icon class="text-slate-400 !text-3xl">{{ icon }}</mat-icon>
      </div>
      <h3 class="text-base font-semibold text-slate-700 mb-1">{{ title }}</h3>
      <p class="text-sm text-slate-400 mb-5 max-w-xs">{{ message }}</p>
      @if (actionLabel && actionRoute) {
        <a [routerLink]="actionRoute">
          <button mat-flat-button color="primary" class="!rounded-lg">
            <mat-icon class="!text-sm mr-1">{{ actionIcon }}</mat-icon>
            {{ actionLabel }}
          </button>
        </a>
      }
      @if (actionLabel && !actionRoute) {
        <button mat-flat-button color="primary" class="!rounded-lg" (click)="onAction()">
          <mat-icon class="!text-sm mr-1">{{ actionIcon }}</mat-icon>
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() message = 'Get started by adding some content.';
  @Input() actionLabel = '';
  @Input() actionRoute = '';
  @Input() actionIcon = 'add';
  @Input() onAction: () => void = () => {};
}
