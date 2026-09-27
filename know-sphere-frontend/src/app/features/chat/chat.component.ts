import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatService } from '../../core/services/chat.service';
import { SettingsService } from '../../core/services/settings.service';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { AiMessageComponent } from '../../shared/components/ai-message/ai-message.component';
import { Source } from '../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatIconModule,
    MatButtonModule, MatTooltipModule, MatMenuModule, MatSnackBarModule,
    AiMessageComponent
  ],
  styles: [`
    :host { display: flex; height: calc(100vh - 64px); overflow: hidden; }
    .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; scroll-behavior: smooth; }
  `],
  template: `
    <div class="flex w-full h-full">

      <!-- ── Left conversation sidebar ───────────────────────────── -->
      <div class="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full transition-all duration-200"
        [class.w-64]="!hideSidebar()"
        [class.w-0]="hideSidebar()"
        [class.overflow-hidden]="hideSidebar()">

        <!-- New chat -->
        <div class="p-3 border-b border-slate-100">
          <button mat-flat-button class="w-full !bg-indigo-600 !text-white !rounded-lg !text-sm" (click)="newChat()">
            <mat-icon class="!text-base mr-1">add</mat-icon> New Chat
          </button>
        </div>

        <!-- Search -->
        <div class="px-3 py-2 border-b border-slate-100">
          <div class="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
            <mat-icon class="!text-sm text-slate-400">search</mat-icon>
            <input [(ngModel)]="searchQuery" placeholder="Search conversations..."
              class="bg-transparent text-xs text-slate-700 flex-1 outline-none placeholder-slate-400" />
          </div>
        </div>

        <!-- Groups -->
        <div class="flex-1 overflow-y-auto py-2">
          @if (chatService.loading()) {
            <div class="flex items-center justify-center py-8">
              <div class="w-5 h-5 border-2 border-indigo-400 border-t-indigo-700 rounded-full animate-spin"></div>
            </div>
          } @else {
            @for (group of chatService.getGroupedConversations(); track group.label) {
              <div class="mb-1">
                <p class="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ group.label }}</p>
                @for (conv of filteredConversations(group.conversations); track conv.id) {
                  <div class="relative group/conv">
                    <button
                      (click)="selectConversation(conv.id)"
                      class="w-full text-left px-3 py-2.5 pr-8 hover:bg-slate-50 transition-colors"
                      [class.bg-indigo-50]="isActive(conv.id)">
                      <div class="flex items-center gap-2">
                        <mat-icon class="!text-sm flex-shrink-0"
                          [class.text-indigo-500]="isActive(conv.id)"
                          [class.text-slate-400]="!isActive(conv.id)">chat_bubble_outline</mat-icon>
                        <span class="text-xs text-slate-700 truncate flex-1"
                          [class.font-semibold]="isActive(conv.id)"
                          [class.text-indigo-700]="isActive(conv.id)">{{ conv.title }}</span>
                      </div>
                    </button>
                    <button
                      (click)="deleteConversation(conv.id)"
                      class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/conv:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
                      <mat-icon class="!text-xs">delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }
            @if (chatService.conversations().length === 0) {
              <div class="text-center py-8 px-4">
                <mat-icon class="!text-3xl text-slate-300 block mx-auto mb-2">chat_bubble_outline</mat-icon>
                <p class="text-xs text-slate-400">No conversations yet</p>
              </div>
            }
          }
        </div>

        <!-- AI Model badge -->
        <div class="px-3 pb-3 border-t border-slate-100 pt-2">
          <div class="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
            <mat-icon class="!text-sm text-indigo-500">auto_awesome</mat-icon>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-indigo-700 truncate">{{ settingsService.currentAIModel }}</p>
              <p class="text-xs text-indigo-400 capitalize">{{ settingsService.currentAIProvider }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Main chat area ───────────────────────────────────────── -->
      <div class="flex-1 flex flex-col h-full bg-slate-50 min-w-0">

        <!-- Header -->
        <div class="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div class="flex items-center gap-2">
            <button mat-icon-button (click)="hideSidebar.set(!hideSidebar())" matTooltip="Toggle sidebar">
              <mat-icon>{{ hideSidebar() ? 'menu_open' : 'menu' }}</mat-icon>
            </button>
            <div>
              <h2 class="text-sm font-semibold text-slate-800 truncate max-w-xs">
                {{ activeConv()?.title || 'New Conversation' }}
              </h2>
              <p class="text-xs text-slate-400">
                {{ activeConv()?.messages?.length || 0 }} messages
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <!-- Share -->
            <button mat-icon-button matTooltip="Copy link" (click)="shareChat()">
              <mat-icon class="!text-slate-500">share</mat-icon>
            </button>
            <!-- Export -->
            <button mat-icon-button matTooltip="Export chat" (click)="exportChat()">
              <mat-icon class="!text-slate-500">download</mat-icon>
            </button>
            <!-- New / Clear -->
            <button mat-icon-button matTooltip="New conversation" (click)="newChat()">
              <mat-icon class="!text-slate-500">edit_note</mat-icon>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div #messagesContainer class="messages-area flex-1">
          @if (!activeConv()?.messages?.length) {
            <div class="flex flex-col items-center justify-center h-full text-center pb-10">
              <div class="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                <mat-icon class="!text-2xl text-indigo-600">auto_awesome</mat-icon>
              </div>
              <h3 class="text-base font-semibold text-slate-700 mb-1">Ask KnowSphere anything</h3>
              <p class="text-sm text-slate-400 max-w-sm mb-2">Get AI-powered answers from your company documents with source references.</p>
              <div class="flex items-center gap-2 text-xs text-slate-400 mb-6 bg-white border border-slate-200 rounded-full px-3 py-1.5">
                <mat-icon class="!text-sm text-indigo-400">auto_awesome</mat-icon>
                Powered by {{ settingsService.currentAIProvider | titlecase }} · {{ settingsService.currentAIModel }}
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full px-4">
                @for (s of suggestions; track s) {
                  <button (click)="sendSuggestion(s)"
                    class="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors leading-relaxed">
                    {{ s }}
                  </button>
                }
              </div>
            </div>
          } @else {
            @for (msg of activeConv()?.messages; track msg.id) {
              <app-ai-message [message]="msg" (openSource)="openSourcePanel($event)" />
            }
            @if (chatService.isStreaming()) {
              <div class="text-xs text-slate-400 flex items-center gap-2 px-2">
                <div class="flex gap-1">
                  <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                </div>
                AI is thinking…
              </div>
            }
          }
        </div>

        <!-- Source reference panel -->
        @if (selectedSource()) {
          <div class="bg-indigo-50 border-t border-indigo-100 px-4 py-3 flex-shrink-0">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <mat-icon class="!text-sm text-indigo-600">{{ getSourceIcon(selectedSource()!.documentType) }}</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <p class="text-xs font-semibold text-indigo-700 truncate">{{ selectedSource()!.documentName }}</p>
                  <span class="text-xs text-indigo-400 flex-shrink-0">{{ selectedSource()!.pageRange }}</span>
                </div>
                <p class="text-xs text-slate-600 italic leading-relaxed">"{{ selectedSource()!.excerpt }}"</p>
              </div>
              <button (click)="selectedSource.set(null)" class="text-indigo-400 hover:text-indigo-600 flex-shrink-0">
                <mat-icon class="!text-sm">close</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- Input area -->
        <div class="bg-white border-t border-slate-200 px-4 py-3 flex-shrink-0">

          <!-- Attached file chips -->
          @if (attachedFiles().length) {
            <div class="flex flex-wrap gap-2 mb-2">
              @for (file of attachedFiles(); track file.name) {
                <div class="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1 text-xs text-indigo-700">
                  <mat-icon class="!text-xs">attach_file</mat-icon>
                  <span class="truncate max-w-32">{{ file.name }}</span>
                  <button (click)="removeAttachment(file)" class="text-indigo-400 hover:text-indigo-700">
                    <mat-icon class="!text-xs">close</mat-icon>
                  </button>
                </div>
              }
            </div>
          }

          <div class="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-400 focus-within:bg-white transition-colors">
            <!-- File attach -->
            <input #fileInput type="file" multiple class="hidden" (change)="onFileAttach($event)" />
            <button mat-icon-button class="!w-7 !h-7 !text-slate-400 hover:!text-indigo-600 flex-shrink-0"
              matTooltip="Attach document" (click)="fileInput.click()">
              <mat-icon class="!text-lg">attach_file</mat-icon>
            </button>

            <textarea
              [(ngModel)]="userInput"
              (keydown.enter)="onEnterKey($any($event))"
              placeholder="Ask a question about your documents..."
              rows="1"
              class="flex-1 bg-transparent text-sm text-slate-700 outline-none resize-none placeholder-slate-400 max-h-32 py-0.5"
              style="field-sizing: content;"></textarea>

            <!-- Send -->
            <button
              (click)="sendMessage()"
              [disabled]="(!userInput.trim() && !attachedFiles().length) || chatService.isStreaming()"
              class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              [class.bg-indigo-600]="userInput.trim() || attachedFiles().length"
              [class.hover:bg-indigo-700]="userInput.trim() || attachedFiles().length"
              [class.bg-slate-200]="!userInput.trim() && !attachedFiles().length"
              [class.cursor-not-allowed]="chatService.isStreaming()">
              <mat-icon class="!text-sm" [class.text-white]="userInput.trim() || attachedFiles().length" [class.text-slate-400]="!userInput.trim()">send</mat-icon>
            </button>
          </div>
          <p class="text-xs text-slate-400 text-center mt-1.5">
            Enter to send · Shift+Enter for new line · Powered by {{ settingsService.currentAIModel }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements AfterViewChecked, OnInit {
  chatService = inject(ChatService);
  settingsService = inject(SettingsService);
  docService = inject(DocumentService);
  toast = inject(ToastService);
  snackBar = inject(MatSnackBar);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  userInput = '';
  searchQuery = '';
  hideSidebar = signal(false);
  selectedSource = signal<Source | null>(null);
  attachedFiles = signal<File[]>([]);

  activeConv = this.chatService.activeConversation;

  suggestions = [
    'What is the employee increment process?',
    'Explain the leave policy in detail',
    'How to apply for IT assets?',
    'Travel reimbursement procedure'
  ];

  ngOnInit(): void {
    this.chatService.loadConversations();
    this.settingsService.getSettings().subscribe();
  }

  filteredConversations(convs: any[]) {
    if (!this.searchQuery.trim()) return convs;
    const q = this.searchQuery.toLowerCase();
    return convs.filter(c => c.title.toLowerCase().includes(q));
  }

  isActive(id: string): boolean { return this.chatService.activeConversation()?.id === id; }
  selectConversation(id: string): void { this.chatService.selectConversation(id); }

  newChat(): void { this.chatService.newConversation(); this.selectedSource.set(null); }

  deleteConversation(id: string): void { this.chatService.deleteConversation(id); }

  sendMessage(): void {
    if ((!this.userInput.trim() && !this.attachedFiles().length) || this.chatService.isStreaming()) return;

    // If files are attached, upload them first then send message
    if (this.attachedFiles().length) {
      const fileList = this.attachedFiles();
      this.docService.uploadFiles(fileList, 'General');
      const names = fileList.map(f => f.name).join(', ');
      this.attachedFiles.set([]);
      const question = this.userInput.trim() || `I uploaded: ${names}. Please process and answer questions about these documents.`;
      this.userInput = '';
      this.chatService.sendMessage(question);
      return;
    }

    this.chatService.sendMessage(this.userInput.trim());
    this.userInput = '';
  }

  sendSuggestion(text: string): void {
    this.userInput = text;
    this.sendMessage();
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) { event.preventDefault(); this.sendMessage(); }
  }

  onFileAttach(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.attachedFiles.update(f => [...f, ...files]);
    input.value = '';
    if (files.length) this.toast.info(`${files.length} file(s) attached`);
  }

  removeAttachment(file: File): void {
    this.attachedFiles.update(f => f.filter(x => x !== file));
  }

  openSourcePanel(source: Source): void { this.selectedSource.set(source); }

  shareChat(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.toast.success('Chat link copied to clipboard');
    }).catch(() => {
      this.snackBar.open('Link: ' + url, 'Copy', { duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
    });
  }

  exportChat(): void {
    const conv = this.activeConv();
    if (!conv?.messages?.length) { this.toast.warn('No messages to export'); return; }
    const text = conv.messages
      .map(m => `[${m.role.toUpperCase()}] ${m.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${conv.title}.txt`; a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Chat exported');
  }

  getSourceIcon(type: string): string {
    if (type === 'PDF') return 'picture_as_pdf';
    if (type === 'XLSX') return 'table_chart';
    return 'description';
  }

  ngAfterViewChecked(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
