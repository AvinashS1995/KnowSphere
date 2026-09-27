import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6 max-w-sm">
      <div class="flex items-start gap-4 mb-5">
        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          [class.bg-red-100]="data.confirmColor === 'warn'"
          [class.bg-indigo-100]="data.confirmColor !== 'warn'">
          <mat-icon [class.text-red-600]="data.confirmColor === 'warn'" [class.text-indigo-600]="data.confirmColor !== 'warn'">
            {{ data.icon || 'warning' }}
          </mat-icon>
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800 mb-1">{{ data.title }}</h3>
          <p class="text-sm text-slate-500 leading-relaxed">{{ data.message }}</p>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button mat-stroked-button class="!border-slate-200 !text-slate-600 !rounded-lg !text-sm"
          (click)="dialogRef.close(false)">Cancel</button>
        <button mat-flat-button
          [color]="data.confirmColor || 'primary'"
          class="!rounded-lg !text-sm"
          (click)="dialogRef.close(true)">
          {{ data.confirmLabel || 'Confirm' }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
