import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { DocumentService } from '../../../core/services/document.service';
import { UploadProgress } from '../../../core/models/document.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatButtonModule, MatSelectModule],
  template: `
    <div class="page-container max-w-3xl">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/documents">
          <button mat-icon-button class="!text-slate-500">
            <mat-icon>arrow_back</mat-icon>
          </button>
        </a>
        <div class="page-header mb-0">
          <h1>Upload Documents</h1>
          <p>Add documents to your knowledge base</p>
        </div>
      </div>

      <!-- Department selector -->
      <div class="mb-4 flex items-center gap-3">
        <label class="text-xs font-semibold text-slate-600 flex-shrink-0">Department</label>
        <select [(ngModel)]="department"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="General">General</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="IT">IT</option>
          <option value="Sales">Sales</option>
          <option value="Admin">Admin</option>
          <option value="Legal">Legal</option>
        </select>
      </div>

      <!-- Drop zone -->
      <div
        class="relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors mb-6 cursor-pointer"
        [class.border-indigo-400]="isDragging()"
        [class.bg-indigo-50]="isDragging()"
        [class.border-slate-300]="!isDragging()"
        [class.bg-white]="!isDragging()"
        (dragover)="onDragOver($event)"
        (dragleave)="isDragging.set(false)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">

        <input #fileInput type="file" multiple accept=".pdf,.docx,.xlsx,.txt,.pptx,.csv"
          class="hidden" (change)="onFileSelect($event)" />

        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
            <mat-icon class="!text-3xl text-indigo-500">cloud_upload</mat-icon>
          </div>
          <h3 class="text-base font-semibold text-slate-700 mb-1">Drag &amp; Drop files here</h3>
          <p class="text-sm text-slate-400 mb-4">or</p>
          <button mat-flat-button class="!bg-indigo-600 !text-white !rounded-lg"
            (click)="$event.stopPropagation(); fileInput.click()">
            Browse Files
          </button>
          <div class="mt-5 space-y-1">
            <p class="text-xs text-slate-400">Supported: <span class="font-medium text-slate-600">PDF, DOCX, XLSX, TXT</span></p>
            <p class="text-xs text-slate-400">Max size: <span class="font-medium text-slate-600">50 MB per file</span></p>
          </div>
        </div>
      </div>

      <!-- Upload progress list -->
      @if (uploads().length) {
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 class="text-sm font-semibold text-slate-700">Upload Progress</h3>
            <span class="text-xs text-slate-400">{{ completedCount() }}/{{ uploads().length }} completed</span>
          </div>
          <div class="divide-y divide-slate-50">
            @for (upload of uploads(); track upload.name) {
              <div class="px-5 py-4">
                <div class="flex items-center gap-3 mb-2">
                  <mat-icon class="!text-base flex-shrink-0" [style.color]="getFileColor(upload.name)">
                    {{ getFileIcon(upload.name) }}
                  </mat-icon>
                  <span class="text-sm font-medium text-slate-700 flex-1 truncate">{{ upload.name }}</span>
                  <span class="text-xs font-semibold flex-shrink-0"
                    [class.text-emerald-600]="upload.status === 'completed'"
                    [class.text-indigo-600]="upload.status === 'uploading' || upload.status === 'processing' || upload.status === 'embedding'"
                    [class.text-slate-400]="upload.status === 'queued'"
                    [class.text-red-500]="upload.status === 'failed'">
                    {{ getStatusLabel(upload) }}
                  </span>
                </div>

                @if (upload.status !== 'queued') {
                  <div class="w-full bg-slate-100 rounded-full h-1.5">
                    <div class="h-1.5 rounded-full transition-all duration-300"
                      [class.bg-indigo-500]="upload.status !== 'completed' && upload.status !== 'failed'"
                      [class.bg-emerald-500]="upload.status === 'completed'"
                      [class.bg-red-400]="upload.status === 'failed'"
                      [class.animate-pulse]="upload.status === 'processing' || upload.status === 'embedding'"
                      [style.width.%]="getProgressWidth(upload)">
                    </div>
                  </div>
                  @if (upload.error) {
                    <p class="text-xs text-red-500 mt-1">{{ upload.error }}</p>
                  }
                } @else {
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-slate-300"></div>
                    <span class="text-xs text-slate-400">Queued for upload</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Pipeline stepper -->
        @if (showStepper()) {
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-6">RAG Processing Pipeline</h3>
            <div class="flex items-start justify-between gap-1">
              @for (step of processingSteps; track step.label; let i = $index; let last = $last) {
                <div class="flex flex-col items-center flex-1">
                  <div class="relative flex items-center w-full">
                    @if (i > 0) {
                      <div class="flex-1 h-0.5 -mr-1"
                        [class.bg-emerald-400]="i <= currentStep()"
                        [class.bg-slate-200]="i > currentStep()"></div>
                    }
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2"
                      [class.bg-emerald-500]="i < currentStep()"
                      [class.border-emerald-500]="i < currentStep()"
                      [class.bg-indigo-600]="i === currentStep()"
                      [class.border-indigo-600]="i === currentStep()"
                      [class.bg-white]="i > currentStep()"
                      [class.border-slate-200]="i > currentStep()">
                      @if (i < currentStep()) {
                        <mat-icon class="!text-sm text-white">check</mat-icon>
                      } @else if (i === currentStep()) {
                        <div class="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                      } @else {
                        <div class="w-2 h-2 bg-slate-200 rounded-full"></div>
                      }
                    </div>
                    @if (!last) {
                      <div class="flex-1 h-0.5 -ml-1"
                        [class.bg-emerald-400]="i < currentStep()"
                        [class.bg-slate-200]="i >= currentStep()"></div>
                    }
                  </div>
                  <span class="text-xs text-center mt-2 font-medium leading-tight"
                    [class.text-emerald-600]="i < currentStep()"
                    [class.text-indigo-700]="i === currentStep()"
                    [class.text-slate-400]="i > currentStep()">{{ step.label }}</span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class UploadComponent implements OnInit, OnDestroy {
  docService = inject(DocumentService);
  isDragging = signal(false);
  uploads = signal<UploadProgress[]>([]);
  currentStep = signal(0);
  showStepper = signal(false);
  department = 'General';

  private sub?: Subscription;

  processingSteps = [
    { label: 'Upload' }, { label: 'Extract Text' }, { label: 'Chunk' },
    { label: 'Embeddings' }, { label: 'Vector DB' }, { label: 'Completed' }
  ];

  completedCount = () => this.uploads().filter(u => u.status === 'completed').length;

  ngOnInit(): void {
    this.sub = this.docService.uploads$.subscribe(ups => {
      this.uploads.set(ups);
      if (ups.some(u => u.status === 'processing' || u.status === 'embedding' || u.status === 'completed')) {
        this.showStepper.set(true);
        this.syncStepperToStatus(ups);
      }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private syncStepperToStatus(ups: UploadProgress[]): void {
    const statuses = ['queued', 'uploading', 'processing', 'embedding', 'completed'];
    const worstStep = Math.max(...ups.map(u => {
      const idx = statuses.indexOf(u.status);
      return idx === -1 ? 0 : idx;
    }));
    const pipelineStep = Math.min(worstStep + 1, this.processingSteps.length - 1);
    if (pipelineStep > this.currentStep()) {
      let s = this.currentStep();
      const target = pipelineStep;
      const interval = setInterval(() => {
        if (s < target) { s++; this.currentStep.set(s); }
        else clearInterval(interval);
      }, 900);
    }
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.isDragging.set(true); }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) this.startUpload(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length) { this.startUpload(files); input.value = ''; }
  }

  private startUpload(files: File[]): void {
    this.currentStep.set(0);
    this.showStepper.set(false);
    this.docService.uploadFiles(files, this.department);
  }

  getStatusLabel(upload: UploadProgress): string {
    const map: Record<string, string> = {
      queued: 'Queued', uploading: `Uploading ${upload.progress}%`,
      processing: 'Processing…', embedding: 'Embedding…', completed: 'Completed', failed: 'Failed'
    };
    return map[upload.status] || upload.status;
  }

  getProgressWidth(upload: UploadProgress): number {
    if (upload.status === 'completed') return 100;
    if (upload.status === 'processing') return 70;
    if (upload.status === 'embedding') return 85;
    return upload.progress;
  }

  getFileIcon(name: string): string {
    if (name.endsWith('.pdf')) return 'picture_as_pdf';
    if (name.endsWith('.xlsx') || name.endsWith('.csv')) return 'table_chart';
    return 'description';
  }
  getFileColor(name: string): string {
    if (name.endsWith('.pdf')) return '#dc2626';
    if (name.endsWith('.xlsx') || name.endsWith('.csv')) return '#16a34a';
    return '#2563eb';
  }
}
