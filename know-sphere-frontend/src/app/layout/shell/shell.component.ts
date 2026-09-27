import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-sidebar
        [mobileOpen]="mobileMenuOpen()"
        [isMobile]="isMobile()"
        (closeMobile)="mobileMenuOpen.set(false)" />

      <app-header
        [sidebarWidth]="isMobile() ? '0px' : sidebarWidth"
        (menuToggle)="mobileMenuOpen.set(!mobileMenuOpen())" />

      <main
        class="pt-16 min-h-screen transition-all duration-300"
        [style.paddingLeft]="isMobile() ? '0' : sidebarWidth">
        <router-outlet />
      </main>
    </div>
  `
})
export class ShellComponent {
  mobileMenuOpen = signal(false);
  isMobile = signal(false);
  sidebarWidth = '240px';

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  constructor() {
    this.isMobile.set(window.innerWidth < 768);
  }
}
