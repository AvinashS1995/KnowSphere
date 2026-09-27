import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ChatMessage, Conversation, ConversationGroup } from '../models/chat.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.apiUrl}/chat`;

  private _conversations = signal<Conversation[]>([]);
  private _activeConversation = signal<Conversation | null>(null);
  private _isStreaming = signal<boolean>(false);
  private _loading = signal<boolean>(false);

  readonly conversations = this._conversations.asReadonly();
  readonly activeConversation = this._activeConversation.asReadonly();
  readonly isStreaming = this._isStreaming.asReadonly();
  readonly loading = this._loading.asReadonly();

  streamToken$ = new Subject<string>();

  // ── Load conversations ─────────────────────────────────────────────
  loadConversations(): void {
    this._loading.set(true);
    this.http.get<{ success: boolean; conversations: any[] }>(this.base).subscribe({
      next: res => {
        const mapped = (res.conversations ?? []).map(this.mapConversation);
        this._conversations.set(mapped);
        if (mapped.length) this.selectConversation(mapped[0].id);
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
  }

  // ── Group by date ──────────────────────────────────────────────────
  getGroupedConversations(): ConversationGroup[] {
    const convs = this._conversations();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const week = new Date(today);
    week.setDate(today.getDate() - 7);

    const groups: ConversationGroup[] = [
      { label: 'Today', conversations: [] },
      { label: 'Yesterday', conversations: [] },
      { label: 'Previous 7 Days', conversations: [] },
      { label: 'Older', conversations: [] }
    ];

    convs.forEach(c => {
      const d = new Date(c.updatedAt);
      if (d >= today) groups[0].conversations.push(c);
      else if (d >= yesterday) groups[1].conversations.push(c);
      else if (d >= week) groups[2].conversations.push(c);
      else groups[3].conversations.push(c);
    });

    return groups.filter(g => g.conversations.length > 0);
  }

  // ── Select & load full messages ────────────────────────────────────
  selectConversation(id: string): void {
    const existing = this._conversations().find(c => c.id === id);
    if (existing?.messages?.length) {
      this._activeConversation.set(existing);
      return;
    }
    this.http.get<{ success: boolean; conversation: any }>(`${this.base}/${id}`).subscribe({
      next: res => {
        const mapped = this.mapConversation(res.conversation);
        this._conversations.update(cs => cs.map(c => c.id === id ? mapped : c));
        this._activeConversation.set(mapped);
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to load conversation')
    });
  }

  // ── New conversation ───────────────────────────────────────────────
  newConversation(): void {
    this.http.post<{ success: boolean; conversation: any }>(this.base, {}).subscribe({
      next: res => {
        const mapped = this.mapConversation(res.conversation);
        this._conversations.update(cs => [mapped, ...cs]);
        this._activeConversation.set(mapped);
      },
      error: () => {
        // Optimistic fallback – create locally
        const local: Conversation = {
          id: 'local-' + Date.now(), title: 'New Conversation', messages: [],
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: ''
        };
        this._conversations.update(cs => [local, ...cs]);
        this._activeConversation.set(local);
      }
    });
  }

  // ── Send message via real API ──────────────────────────────────────
  sendMessage(question: string): void {
    const conv = this._activeConversation();
    if (!conv || this._isStreaming()) return;

    const tempUserId = 'u-' + Date.now();
    const tempAiId  = 'a-' + Date.now();

    const userMsg: ChatMessage = {
      id: tempUserId, role: 'user', content: question, timestamp: new Date().toISOString()
    };
    const aiMsg: ChatMessage = {
      id: tempAiId, role: 'assistant', content: '', isStreaming: true, timestamp: new Date().toISOString()
    };

    this._isStreaming.set(true);
    this.addMessageToActive(userMsg);
    this.addMessageToActive(aiMsg);

    const payload: Record<string, string> = { question };
    if (!conv.id.startsWith('local-')) payload['conversationId'] = conv.id;

    this.http.post<{
      success: boolean;
      conversationId: string;
      message: { id: string; role: string; content: string; sources?: any[]; createdAt: string }
    }>(`${this.base}/message`, payload).subscribe({
      next: res => {
        const answer = res.message.content;
        const words = answer.split(' ');
        let idx = 0;

        // Simulate word-by-word reveal for UX
        const interval = setInterval(() => {
          if (idx < words.length) {
            const partial = words.slice(0, idx + 1).join(' ');
            this._activeConversation.update(c => c ? {
              ...c,
              messages: c.messages.map(m =>
                m.id === tempAiId ? { ...m, content: partial } : m
              )
            } : c);
            idx++;
          } else {
            clearInterval(interval);
            this._isStreaming.set(false);
            // Finalize with sources
            const finalMsg: ChatMessage = {
              id: res.message.id ?? tempAiId,
              role: 'assistant',
              content: answer,
              sources: res.message.sources,
              isStreaming: false,
              timestamp: res.message.createdAt
            };
            // Update conversation id if it was local
            if (conv.id.startsWith('local-')) {
              this._conversations.update(cs => cs.map(c =>
                c.id === conv.id ? { ...c, id: res.conversationId, title: question.slice(0, 50) } : c
              ));
            }
            this._activeConversation.update(c => c ? {
              ...c,
              id: res.conversationId,
              title: question.slice(0, 50),
              messages: c.messages.map(m => m.id === tempAiId ? finalMsg : m)
            } : c);
          }
        }, 35);
      },
      error: err => {
        this._isStreaming.set(false);
        const errMsg: ChatMessage = {
          id: tempAiId, role: 'assistant',
          content: "I couldn't generate an answer right now. Please try again.",
          error: true, isStreaming: false, timestamp: new Date().toISOString()
        };
        this._activeConversation.update(c => c ? {
          ...c, messages: c.messages.map(m => m.id === tempAiId ? errMsg : m)
        } : c);
        this.toast.error(err?.error?.message ?? 'AI request failed');
      }
    });
  }

  deleteConversation(id: string): void {
    this.http.delete(`${this.base}/${id}`).subscribe({
      next: () => {
        this._conversations.update(cs => cs.filter(c => c.id !== id));
        const remaining = this._conversations();
        this._activeConversation.set(remaining.length ? remaining[0] : null);
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to delete')
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────
  private addMessageToActive(msg: ChatMessage): void {
    this._activeConversation.update(c => c ? { ...c, messages: [...c.messages, msg] } : c);
    const convId = this._activeConversation()?.id;
    if (convId) {
      this._conversations.update(cs => cs.map(c =>
        c.id === convId ? { ...c, messages: [...c.messages, msg], title: c.title } : c
      ));
    }
  }

  private mapConversation = (c: any): Conversation => ({
    id: c._id ?? c.id,
    title: c.title ?? 'Conversation',
    userId: c.userId ?? '',
    messages: (c.messages ?? []).map((m: any): ChatMessage => ({
      id: m._id ?? m.id,
      role: m.role,
      content: m.content,
      sources: m.sources,
      timestamp: m.createdAt ?? new Date().toISOString(),
      isStreaming: false
    })),
    createdAt: c.createdAt ?? new Date().toISOString(),
    updatedAt: c.updatedAt ?? new Date().toISOString()
  });
}
