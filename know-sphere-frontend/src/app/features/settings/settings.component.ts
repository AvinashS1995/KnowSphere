import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatButtonModule, MatSlideToggleModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header mb-6">
        <h1>Settings</h1>
        <p>Configure your KnowSphere workspace</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-5">

        <!-- Left nav -->
        <div class="lg:w-48 flex-shrink-0">
          <nav class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            @for (section of sections; track section.key) {
              <button
                (click)="activeSection.set(section.key)"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2"
                [class.border-indigo-500]="activeSection() === section.key"
                [class.bg-indigo-50]="activeSection() === section.key"
                [class.text-indigo-700]="activeSection() === section.key"
                [class.border-transparent]="activeSection() !== section.key"
                [class.text-slate-600]="activeSection() !== section.key"
                [class.hover:bg-slate-50]="activeSection() !== section.key">
                <mat-icon class="!text-base flex-shrink-0">{{ section.icon }}</mat-icon>
                {{ section.label }}
              </button>
            }
          </nav>
        </div>

        <!-- Settings content -->
        <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm">

          @if (activeSection() === 'general') {
            <div class="p-6 border-b border-slate-100">
              <h2 class="text-base font-bold text-slate-800 mb-1">General Settings</h2>
              <p class="text-xs text-slate-400">Basic application configuration</p>
            </div>
            <div class="p-6 space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Application Name</label>
                  <input value="KnowSphere" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Timezone</label>
                  <select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                    <option>America/New_York</option>
                  </select>
                </div>
              </div>
            </div>
          }

          @if (activeSection() === 'ai') {
            <div class="p-6 border-b border-slate-100">
              <h2 class="text-base font-bold text-slate-800 mb-1">AI Configuration</h2>
              <p class="text-xs text-slate-400">Configure AI provider and model settings</p>
            </div>
            <div class="p-6 space-y-5">
              <!-- AI Provider -->
              <div>
                <h3 class="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">AI Model</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">AI Provider</label>
                    <select [(ngModel)]="aiProvider" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Gemini</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Model</label>
                    <select class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>gpt-4o</option>
                      <option>gpt-4o-mini</option>
                      <option>gpt-4-turbo</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Temperature</label>
                    <input type="number" value="0.2" step="0.1" min="0" max="1"
                      class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <p class="text-xs text-slate-400 mt-1">Lower = more deterministic (0–1)</p>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Max Tokens</label>
                    <input type="number" value="2000"
                      class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              <!-- Vector DB -->
              <div>
                <h3 class="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Vector Database</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Provider</label>
                    <input value="Qdrant" disabled class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">Collection Name</label>
                    <input value="knowledge-base"
                      class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
          }

          @if (activeSection() === 'processing') {
            <div class="p-6 border-b border-slate-100">
              <h2 class="text-base font-bold text-slate-800 mb-1">Document Processing</h2>
              <p class="text-xs text-slate-400">Configure chunking and retrieval parameters</p>
            </div>
            <div class="p-6 space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Chunk Size</label>
                  <input type="number" value="1000" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <p class="text-xs text-slate-400 mt-1">Characters per chunk</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Chunk Overlap</label>
                  <input type="number" value="150" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <p class="text-xs text-slate-400 mt-1">Overlap between chunks</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Top K Results</label>
                  <input type="number" value="5" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <p class="text-xs text-slate-400 mt-1">Documents retrieved per query</p>
                </div>
              </div>
            </div>
          }

          @if (activeSection() === 'security') {
            <div class="p-6 border-b border-slate-100">
              <h2 class="text-base font-bold text-slate-800 mb-1">Security</h2>
              <p class="text-xs text-slate-400">Authentication and access control settings</p>
            </div>
            <div class="p-6 space-y-5">
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p class="text-sm font-medium text-slate-700">Multi-Factor Authentication</p>
                  <p class="text-xs text-slate-400 mt-0.5">Require MFA for all users</p>
                </div>
                <mat-slide-toggle color="primary"></mat-slide-toggle>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Session Timeout (minutes)</label>
                <input type="number" value="30" class="w-full sm:w-48 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">Allowed Email Domains</label>
                <input value="company.com" placeholder="e.g. company.com"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <p class="text-xs text-slate-400 mt-1">Comma-separated domains</p>
              </div>
            </div>
          }

          @if (activeSection() === 'notifications') {
            <div class="p-6 border-b border-slate-100">
              <h2 class="text-base font-bold text-slate-800 mb-1">Notifications</h2>
              <p class="text-xs text-slate-400">Manage notification preferences</p>
            </div>
            <div class="p-6 space-y-3">
              @for (notif of notifications; track notif.key) {
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ notif.label }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ notif.desc }}</p>
                  </div>
                  <mat-slide-toggle color="primary" [checked]="notif.enabled"></mat-slide-toggle>
                </div>
              }
            </div>
          }

          <!-- Save button (always visible at bottom) -->
          <div class="px-6 py-4 border-t border-slate-100 flex justify-end">
            <button mat-flat-button (click)="saveSettings()"
              class="!bg-indigo-600 !text-white !rounded-lg !text-sm !px-6">
              <mat-icon class="!text-base mr-1">save</mat-icon> Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private snackBar = inject(MatSnackBar);
  activeSection = signal('general');
  aiProvider = 'openai';

  sections = [
    { key: 'general', label: 'General', icon: 'settings' },
    { key: 'ai', label: 'AI Configuration', icon: 'psychology' },
    { key: 'processing', label: 'Document Processing', icon: 'auto_fix_high' },
    { key: 'security', label: 'Security', icon: 'security' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications' }
  ];

  notifications = [
    { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email', enabled: true },
    { key: 'processing', label: 'Processing Complete', desc: 'When document processing finishes', enabled: true },
    { key: 'alerts', label: 'Query Alerts', desc: 'Alert on unusual query patterns', enabled: false },
    { key: 'report', label: 'Weekly Report', desc: 'Receive weekly usage summary', enabled: true }
  ];

  saveSettings(): void {
    this.snackBar.open('Settings saved successfully!', 'Close', {
      duration: 3000,
      panelClass: ['bg-emerald-600', 'text-white'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}


