import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SourceCitationComponent } from '../source-citation/source-citation.component';
import { ChatMessage } from '../../../core/models/chat.model';
import { Source } from '../../../core/models/chat.model';

@Component({
  selector: 'app-ai-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, SourceCitationComponent],
  template: `
    <div class="flex gap-3 group" [class.justify-end]="message.role === 'user'">

      @if (message.role === 'assistant') {
        <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
          <mat-icon class="!text-sm text-white">auto_awesome</mat-icon>
        </div>
      }

      <div [class.max-w-2xl]="true" [class.w-full]="message.role === 'assistant'">
        @if (message.role === 'user') {
          <div class="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed ml-auto max-w-lg">
            {{ message.content }}
          </div>
        } @else {
          <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            @if (message.isStreaming && !message.content) {
              <div class="flex items-center gap-2 text-slate-400 text-sm">
                <div class="flex gap-1">
                  <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                </div>
                <span class="text-xs">AI is thinking...</span>
              </div>
            } @else {
              <div class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{{ message.content }}</div>
              @if (message.isStreaming) {
                <span class="inline-block w-0.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle"></span>
              }
            }
            @if (message.sources && message.sources.length && !message.isStreaming) {
              <app-source-citation [sources]="message.sources" (openSource)="openSource.emit($event)" />
            }
          </div>
        }
        <div class="text-xs text-slate-400 mt-1 px-1"
          [class.text-right]="message.role === 'user'">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>

      @if (message.role === 'user') {
        <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
          <mat-icon class="!text-sm text-slate-600">person</mat-icon>
        </div>
      }
    </div>
  `
})
export class AiMessageComponent {
  @Input() message!: ChatMessage;
  @Output() openSource = new EventEmitter<Source>();

  formatTime(ts: string): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
