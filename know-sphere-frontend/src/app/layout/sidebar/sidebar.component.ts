import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, MatIconModule, MatTooltipModule],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0f1729] transition-transform duration-300"
      [class.w-60]="!collapsed"
      [class.w-16]="collapsed"
      [class.-translate-x-full]="mobileOpen === false && isMobile"
      [class.translate-x-0]="mobileOpen || !isMobile">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <mat-icon class="!text-white !text-lg">hub</mat-icon>
        </div>
        @if (!collapsed) {
          <div>
            <p class="text-white font-bold text-sm leading-tight">KnowSphere</p>
            <p class="text-indigo-300 text-xs">Enterprise Copilot</p>
          </div>
        }
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        @for (item of visibleNavItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-400"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group relative"
            [matTooltip]="collapsed ? item.label : ''"
            matTooltipPosition="right">
            <mat-icon class="!text-xl flex-shrink-0 group-[.active]:text-indigo-400">{{ item.icon }}</mat-icon>
            @if (!collapsed) {
              <span class="text-sm font-medium">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Collapse toggle (desktop) -->
      <div class="p-2 border-t border-white/10">
        <button
          (click)="collapsed = !collapsed"
          class="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <mat-icon class="!text-xl">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </aside>

    <!-- Mobile overlay -->
    @if (mobileOpen && isMobile) {
      <div class="fixed inset-0 z-30 bg-black/50" (click)="closeMobile.emit()"></div>
    }
  `
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Input() isMobile = false;
  @Output() closeMobile = new EventEmitter<void>();

  auth = inject(AuthService);
  collapsed = false;

  navItems: NavItem[] = [
    { label: 'Home', icon: 'home', route: '/dashboard' },
    { label: 'Chat', icon: 'chat_bubble_outline', route: '/chat' },
    { label: 'Documents', icon: 'folder_open', route: '/documents' },
    { label: 'Knowledge Base', icon: 'auto_stories', route: '/knowledge-base' },
    { label: 'Analytics', icon: 'bar_chart', route: '/analytics', adminOnly: true },
    { label: 'Users', icon: 'group', route: '/users', adminOnly: true },
    { label: 'Settings', icon: 'settings', route: '/settings', adminOnly: true }
  ];

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(item => !item.adminOnly || this.auth.isAdmin());
  }
}
