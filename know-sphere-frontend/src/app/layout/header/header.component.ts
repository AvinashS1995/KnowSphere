import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatButtonModule, MatBadgeModule],
  template: `
    <header class="fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4 left-0">

      <!-- Mobile menu button -->
      <button mat-icon-button class="!-ml-2 flex md:hidden" (click)="menuToggle.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Search -->
      <div class="flex-1 max-w-md hidden sm:block" [style.marginLeft]="sidebarWidth">
        <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer group">
          <mat-icon class="!text-base text-slate-400 group-hover:text-indigo-500">search</mat-icon>
          <span class="text-sm text-slate-400 flex-1">Search documents, ask a question...</span>
          <kbd class="hidden lg:inline text-xs text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">Ctrl+K</kbd>
        </div>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <!-- Notifications -->
        <button mat-icon-button>
          <mat-icon [matBadge]="'3'" matBadgeSize="small" matBadgeColor="warn">notifications_none</mat-icon>
        </button>

        <!-- User menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="!pl-2 !pr-1">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span class="text-sm font-semibold text-indigo-700">{{ userInitial }}</span>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-medium text-slate-700 leading-tight">{{ user?.name }}</p>
              <p class="text-xs text-slate-400 capitalize leading-tight">{{ user?.role }}</p>
            </div>
            <mat-icon class="!text-base text-slate-400">expand_more</mat-icon>
          </div>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="px-4 py-2 border-b border-slate-100">
            <p class="text-sm font-medium text-slate-800">{{ user?.name }}</p>
            <p class="text-xs text-slate-400">{{ user?.email }}</p>
          </div>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon> Settings
          </button>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>
        </mat-menu>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() sidebarWidth = '240px';
  @Output() menuToggle = new EventEmitter<void>();

  auth = inject(AuthService);
  get user() { return this.auth.currentUser(); }
  get userInitial() { return this.user?.name?.charAt(0) ?? 'U'; }
}
