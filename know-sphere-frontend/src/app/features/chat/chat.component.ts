import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatService } from '../../core/services/chat.service';
import { AiMessageComponent } from '../../shared/components/ai-message/ai-message.component';
import { Source } from '../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule, AiMessageComponent],
  styles: [`
    :host { display: flex; height: calc(100vh - 64px); overflow: hidden; }
    .chat-panel { display: flex; flex-direction: column; height: 100%; }
    .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  `],
  template: `
    <div class="flex w-full h-full">

      <!-- Left sidebar: conversation list -->
      <div class="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full"
        [class.hidden]="hideSidebar()">

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

        <!-- Conversation groups -->
        <div class="flex-1 overflow-y-auto py-2">
          @for (group of chatService.getGroupedConversations(); track group.label) {
            <div class="mb-2">
              <p class="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ group.label }}</p>
              @for (conv of group.conversations; track conv.id) {
                <button
                  (click)="selectConversation(conv.id)"
                  class="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors group"
                  [class.bg-indigo-50]="isActive(conv.id)">
                  <div class="flex items-center gap-2">
                    <mat-icon class="!text-sm flex-shrink-0"
                      [class.text-indigo-500]="isActive(conv.id)"
                      [class.text-slate-400]="!isActive(conv.id)">chat_bubble_outline</mat-icon>
                    <span class="text-xs text-slate-700 truncate"
                      [class.font-semibold]="isActive(conv.id)"
                      [class.text-indigo-700]="isActive(conv.id)">{{ conv.title }}</span>
                  </div>
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Main chat area -->
      <div class="flex-1 flex flex-col h-full bg-slate-50 min-w-0">

        <!-- Chat header -->
        <div class="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div class="flex items-center gap-2">
            <button mat-icon-button class="md:hidden" (click)="hideSidebar.set(!hideSidebar())">
              <mat-icon>menu</mat-icon>
            </button>
            <div>
              <h2 class="text-sm font-semibold text-slate-800">{{ activeConv()?.title || 'New Chat' }}</h2>
              <p class="text-xs text-slate-400">{{ activeConv()?.messages?.length || 0 }} messages</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button mat-icon-button matTooltip="Share" class="!text-slate-500">
              <mat-icon>share</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Clear" class="!text-slate-500" (click)="newChat()">
              <mat-icon>delete_outline</mat-icon>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div #messagesContainer class="messages-area flex-1">
          @if (!activeConv()?.messages?.length) {
            <div class="flex-1 flex flex-col items-center justify-center py-16 text-center">
              <div class="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                <mat-icon class="!text-2xl text-indigo-600">auto_awesome</mat-icon>
              </div>
              <h3 class="text-base font-semibold text-slate-700 mb-2">Ask KnowSphere anything</h3>
              <p class="text-sm text-slate-400 max-w-sm">Ask questions about your company documents and get instant answers with source references.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg w-full">
                @for (suggestion of suggestions; track suggestion) {
                  <button
                    (click)="sendSuggestion(suggestion)"
                    class="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    {{ suggestion }}
                  </button>
                }
              </div>
            </div>
          } @else {
            @for (msg of activeConv()?.messages; track msg.id) {
              <app-ai-message [message]="msg" (openSource)="openSourcePanel($event)" />
            }
          }
        </div>

        <!-- Input area -->
        <div class="bg-white border-t border-slate-200 p-4 flex-shrink-0">
          @if (selectedSource()) {
            <div class="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-2">
              <mat-icon class="!text-sm text-indigo-600 mt-0.5 flex-shrink-0">picture_as_pdf</mat-icon>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-indigo-700">{{ selectedSource()?.documentName }}</p>
                <p class="text-xs text-indigo-500">{{ selectedSource()?.pageRange }}</p>
                <p class="text-xs text-slate-600 mt-1 italic">"{{ selectedSource()?.excerpt }}"</p>
              </div>
              <button (click)="selectedSource.set(null)" class="text-indigo-400 hover:text-indigo-600">
                <mat-icon class="!text-sm">close</mat-icon>
              </button>
            </div>
          }

          <div class="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-indigo-400 focus-within:bg-white transition-colors">
            <button mat-icon-button class="!text-slate-400 hover:!text-indigo-600 flex-shrink-0 mb-0.5" matTooltip="Attach file">
              <mat-icon>attach_file</mat-icon>
            </button>
            <textarea
              [(ngModel)]="userInput"
              (keydown.enter)="onEnterKey($any($event))"
              placeholder="Ask a question about your documents..."
              rows="1"
              class="flex-1 bg-transparent text-sm text-slate-700 outline-none resize-none placeholder-slate-400 max-h-32"
              style="field-sizing: content;"></textarea>
            <button
              (click)="sendMessage()"
              [disabled]="!userInput.trim() || chatService.isStreaming()"
              class="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
              <mat-icon class="!text-base" [class.text-white]="userInput.trim()" [class.text-slate-400]="!userInput.trim()">send</mat-icon>
            </button>
          </div>
          <p class="text-xs text-slate-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements AfterViewChecked, OnInit {
  chatService = inject(ChatService);
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  userInput = '';
  searchQuery = '';
  hideSidebar = signal(false);
  selectedSource = signal<Source | null>(null);

  activeConv = this.chatService.activeConversation;

  ngOnInit(): void {
    this.chatService.loadConversations();
  }

  suggestions = [
    'What is the employee increment process?',
    'Explain the leave policy',
    'How to apply for IT assets?',
    'Travel reimbursement procedure'
  ];

  isActive(id: string): boolean {
    return this.chatService.activeConversation()?.id === id;
  }

  selectConversation(id: string): void {
    this.chatService.selectConversation(id);
  }

  newChat(): void {
    this.chatService.newConversation();
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.chatService.isStreaming()) return;
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

  openSourcePanel(source: Source): void {
    this.selectedSource.set(source);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
