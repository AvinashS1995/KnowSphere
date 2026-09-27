import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../core/services/settings.service';
import { AppSettings, AIProvider } from '../../core/models/settings.model';
import {
  AI_PROVIDERS_META, getActiveModels, getFreeModels,
  getPaidModels, getRecommendedModels, getModelByValue,
  getModelLimits, formatContext, formatPrice
} from '../../core/models/ai-models.registry';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatIconModule, MatButtonModule, MatSlideToggleModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">

      <!-- Page header -->
      <div class="flex items-center justify-between mb-6">
        <div class="page-header mb-0">
          <h1>Settings</h1>
          <p>Configure your KnowSphere workspace</p>
        </div>
        @if (saving()) {
          <div class="flex items-center gap-2 text-sm text-indigo-600">
            <mat-spinner diameter="16"></mat-spinner> Saving…
          </div>
        }
      </div>

      <div class="flex flex-col lg:flex-row gap-5">

        <!-- ── Left nav ───────────────────────────────────────────── -->
        <div class="lg:w-52 flex-shrink-0">
          <nav class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            @for (s of sections; track s.key) {
              <button (click)="activeSection.set(s.key)"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2"
                [class.border-indigo-500]="activeSection() === s.key"
                [class.bg-indigo-50]="activeSection() === s.key"
                [class.text-indigo-700]="activeSection() === s.key"
                [class.border-transparent]="activeSection() !== s.key"
                [class.text-slate-600]="activeSection() !== s.key">
                <mat-icon class="!text-base flex-shrink-0">{{ s.icon }}</mat-icon>
                {{ s.label }}
              </button>
            }
          </nav>
        </div>

        <!-- ── Content panel ──────────────────────────────────────── -->
        @if (form) {
          <form [formGroup]="form" (ngSubmit)="save()" class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm min-w-0">

            <!-- ──────────────── GENERAL ──────────────────────────── -->
            @if (activeSection() === 'general') {
              <div class="p-6 border-b border-slate-100">
                <h2 class="text-sm font-bold text-slate-800 mb-0.5">General Settings</h2>
                <p class="text-xs text-slate-400">Basic application configuration</p>
              </div>
              <div class="p-6 space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label class="ks-label">Application Name</label>
                    <input [formControl]="f('general.appName')" class="ks-input" />
                  </div>
                  <div>
                    <label class="ks-label">Timezone</label>
                    <select [formControl]="f('general.timezone')" class="ks-input">
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    </select>
                  </div>
                  <div>
                    <label class="ks-label">Language</label>
                    <select [formControl]="f('general.language')" class="ks-input">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
            }

            <!-- ──────────────── AI CONFIGURATION ────────────────── -->
            @if (activeSection() === 'ai') {
              <div class="p-6 border-b border-slate-100">
                <h2 class="text-sm font-bold text-slate-800 mb-0.5">AI Configuration</h2>
                <p class="text-xs text-slate-400">Choose provider, model and parameters — applied instantly to all chat</p>
              </div>

              <div class="p-6 space-y-6" formGroupName="ai">

                <!-- Security notice (replaces API key input) -->
                <div class="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <mat-icon class="!text-base text-slate-400 mt-0.5 flex-shrink-0">lock</mat-icon>
                  <div>
                    <p class="text-xs font-semibold text-slate-700 mb-0.5">API credentials managed securely by the server</p>
                    <p class="text-xs text-slate-500 leading-relaxed">
                      API keys for OpenAI, Gemini and OpenRouter are stored only in backend environment variables (.env).
                      They are never sent to the browser. Set them in <code class="bg-slate-100 px-1 rounded text-slate-600">know-sphere-backend/.env</code>.
                    </p>
                  </div>
                </div>

                <!-- ── Provider cards ───────────────────────────── -->
                <div>
                  <label class="ks-label mb-3">AI Provider</label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    @for (p of providerList; track p.value) {
                      <button type="button" (click)="setProvider(p.value)"
                        class="p-3.5 border-2 rounded-xl text-left transition-all"
                        [class.border-indigo-500]="selectedProvider === p.value"
                        [class.bg-indigo-50]="selectedProvider === p.value"
                        [class.border-slate-200]="selectedProvider !== p.value">
                        <div class="flex items-center gap-2 mb-1.5">
                          <span class="text-lg leading-none">{{ p.emoji }}</span>
                          <span class="text-sm font-bold text-slate-800">{{ p.label }}</span>
                          @if (p.hasFree) {
                            <span class="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">Free tier</span>
                          }
                          @if (selectedProvider === p.value) {
                            <mat-icon class="!text-sm text-indigo-600 ml-auto">check_circle</mat-icon>
                          }
                        </div>
                        <p class="text-xs text-slate-500 leading-tight">{{ p.description }}</p>
                      </button>
                    }
                  </div>
                </div>

                <!-- ── Filter tabs ──────────────────────────────── -->
                <div>
                  <div class="flex items-center gap-1 mb-3">
                    <label class="ks-label flex-1">Model</label>
                    <div class="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                      @for (tab of modelTabs; track tab.key) {
                        <button type="button"
                          (click)="modelFilter.set(tab.key)"
                          class="px-3 py-1 text-xs font-medium rounded-md transition-colors"
                          [class.bg-white]="modelFilter() === tab.key"
                          [class.text-slate-800]="modelFilter() === tab.key"
                          [class.shadow-sm]="modelFilter() === tab.key"
                          [class.text-slate-500]="modelFilter() !== tab.key">
                          {{ tab.label }}
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Model cards grid -->
                  <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
                    @for (model of filteredModels; track model.value) {
                      <button type="button"
                        (click)="selectModel(model.value)"
                        class="w-full text-left border-2 rounded-xl transition-all p-4"
                        [class.border-indigo-500]="selectedModel === model.value"
                        [class.bg-indigo-50]="selectedModel === model.value"
                        [class.border-slate-200]="selectedModel !== model.value"
                        [class.hover:border-slate-300]="selectedModel !== model.value">

                        <div class="flex items-start justify-between gap-3">
                          <div class="flex-1 min-w-0">
                            <!-- Name + badges -->
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                              <span class="text-sm font-bold text-slate-800">{{ model.label }}</span>
                              @if (model.recommended) {
                                <span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">⭐ Recommended</span>
                              }
                              @if (model.free) {
                                <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">FREE</span>
                              } @else {
                                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">PAID</span>
                              }
                              @if (model.status === 'legacy') {
                                <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Legacy</span>
                              }
                            </div>

                            <p class="text-xs text-slate-500 mb-2 leading-relaxed">{{ model.description }}</p>

                            <!-- Specs row -->
                            <div class="flex flex-wrap gap-3 text-xs text-slate-500">
                              @if (model.contextWindow) {
                                <div class="flex items-center gap-1">
                                  <mat-icon class="!text-xs text-slate-400">memory</mat-icon>
                                  <span>{{ formatContext(model.contextWindow) }} ctx</span>
                                </div>
                              }
                              @if (model.maxOutputTokens) {
                                <div class="flex items-center gap-1">
                                  <mat-icon class="!text-xs text-slate-400">output</mat-icon>
                                  <span>{{ formatContext(model.maxOutputTokens) }} out</span>
                                </div>
                              }
                              @if (model.requestsPerMinute || model.requestsPerDay) {
                                <div class="flex items-center gap-1">
                                  <mat-icon class="!text-xs text-slate-400">speed</mat-icon>
                                  <span>{{ getModelLimits(model) }}</span>
                                </div>
                              }
                            </div>

                            <!-- Pricing row -->
                            @if (!model.free || model.inputPricePer1M !== null) {
                              <div class="flex gap-3 mt-1.5 text-xs">
                                <span class="text-slate-500">
                                  In: <span class="font-semibold" [class.text-emerald-600]="model.inputPricePer1M === 0" [class.text-slate-700]="model.inputPricePer1M !== 0">
                                    {{ formatPrice(model.inputPricePer1M) }}/1M
                                  </span>
                                </span>
                                <span class="text-slate-500">
                                  Out: <span class="font-semibold" [class.text-emerald-600]="model.outputPricePer1M === 0" [class.text-slate-700]="model.outputPricePer1M !== 0">
                                    {{ formatPrice(model.outputPricePer1M) }}/1M
                                  </span>
                                </span>
                                @if (model.free && model.resetTime) {
                                  <span class="text-slate-400">Resets {{ model.reset }} {{ model.resetTime }}</span>
                                }
                              </div>
                            }

                            <!-- Recommended for tags -->
                            @if (model.recommendedFor.length && selectedModel === model.value) {
                              <div class="flex flex-wrap gap-1 mt-2">
                                @for (tag of model.recommendedFor; track tag) {
                                  <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{{ tag }}</span>
                                }
                              </div>
                            }
                          </div>

                          <!-- Selected checkmark -->
                          @if (selectedModel === model.value) {
                            <mat-icon class="text-indigo-600 flex-shrink-0 mt-0.5">check_circle</mat-icon>
                          }
                        </div>
                      </button>
                    }

                    @if (filteredModels.length === 0) {
                      <div class="text-center py-8 text-sm text-slate-400">No models match the current filter.</div>
                    }
                  </div>
                </div>

                <!-- ── Parameters ───────────────────────────────── -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                  <div>
                    <label class="ks-label">
                      Temperature: <span class="text-indigo-600 font-bold">{{ form.get('ai.temperature')?.value }}</span>
                    </label>
                    <input type="range" formControlName="temperature" min="0" max="1" step="0.05"
                      class="w-full accent-indigo-600 mt-1" />
                    <div class="flex justify-between text-xs text-slate-400 mt-0.5">
                      <span>0 – Precise / deterministic</span>
                      <span>1 – Creative</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">
                      Recommended: 0.1–0.3 for RAG, 0.7+ for creative tasks.
                    </p>
                  </div>
                  <div>
                    <label class="ks-label">Max Output Tokens</label>
                    <input type="number" formControlName="maxTokens" min="256" max="65536" step="256" class="ks-input" />
                    <p class="text-xs text-slate-400 mt-1">
                      Maximum tokens in AI response. 2000 is suitable for most RAG answers.
                    </p>
                    @if (activeModel) {
                      <p class="text-xs text-indigo-500 mt-0.5">
                        Model limit: {{ formatContext(activeModel!.maxOutputTokens) }}
                      </p>
                    }
                  </div>
                </div>

              </div>
            }

            <!-- ──────────────── VECTOR DB ───────────────────────── -->
            @if (activeSection() === 'vector') {
              <div class="p-6 border-b border-slate-100">
                <h2 class="text-sm font-bold text-slate-800 mb-0.5">Vector Database</h2>
                <p class="text-xs text-slate-400">Qdrant configuration for semantic search and retrieval</p>
              </div>
              <div class="p-6 space-y-5" formGroupName="vectorDB">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label class="ks-label">Provider</label>
                    <input value="Qdrant" disabled class="ks-input bg-slate-50 text-slate-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label class="ks-label">Qdrant URL</label>
                    <input formControlName="url" class="ks-input" placeholder="http://localhost:6333" />
                    <p class="text-xs text-slate-400 mt-1">Local: http://localhost:6333 · Cloud: your Qdrant cluster URL</p>
                  </div>
                  <div>
                    <label class="ks-label">Collection Name</label>
                    <input formControlName="collection" class="ks-input" />
                    <p class="text-xs text-slate-400 mt-1">The vector collection where document embeddings are stored</p>
                  </div>
                </div>
                <div class="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <mat-icon class="!text-base text-slate-400 mt-0.5 flex-shrink-0">lock</mat-icon>
                  <p class="text-xs text-slate-500 leading-relaxed">
                    Qdrant API key (for cloud deployments) is managed in <code class="bg-slate-100 px-1 rounded">backend/.env</code> as <code class="bg-slate-100 px-1 rounded">QDRANT_API_KEY</code>. It is never sent to the frontend.
                  </p>
                </div>
              </div>
            }

            <!-- ──────────────── DOCUMENT PROCESSING ─────────────── -->
            @if (activeSection() === 'processing') {
              <div class="p-6 border-b border-slate-100">
                <h2 class="text-sm font-bold text-slate-800 mb-0.5">Document Processing</h2>
                <p class="text-xs text-slate-400">Controls how documents are split, embedded and retrieved for RAG</p>
              </div>
              <div class="p-6 space-y-5" formGroupName="documentProcessing">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label class="ks-label">Chunk Size</label>
                    <input type="number" formControlName="chunkSize" class="ks-input" />
                    <p class="text-xs text-slate-400 mt-1">Characters per chunk. 800–1200 recommended.</p>
                  </div>
                  <div>
                    <label class="ks-label">Chunk Overlap</label>
                    <input type="number" formControlName="chunkOverlap" class="ks-input" />
                    <p class="text-xs text-slate-400 mt-1">Overlap between chunks. 10–20% of chunk size.</p>
                  </div>
                  <div>
                    <label class="ks-label">Top K Results</label>
                    <input type="number" formControlName="topK" class="ks-input" />
                    <p class="text-xs text-slate-400 mt-1">Document chunks retrieved per query. 3–7 is optimal.</p>
                  </div>
                  <div>
                    <label class="ks-label">Min. Relevance Score</label>
                    <input type="number" formControlName="minRelevanceScore" step="0.05" min="0" max="1" class="ks-input" />
                    <p class="text-xs text-slate-400 mt-1">0–1. Chunks below this score are excluded.</p>
                  </div>
                </div>
              </div>
            }

            <!-- ──────────────── SECURITY ────────────────────────── -->
            @if (activeSection() === 'security') {
              <div class="p-6 border-b border-slate-100">
                <h2 class="text-sm font-bold text-slate-800 mb-0.5">Security</h2>
                <p class="text-xs text-slate-400">Authentication and access control configuration</p>
              </div>
              <div class="p-6 space-y-4" formGroupName="security">
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p class="text-sm font-medium text-slate-700">Multi-Factor Authentication</p>
                    <p class="text-xs text-slate-400 mt-0.5">Require MFA for all users on login</p>
                  </div>
                  <mat-slide-toggle color="primary" formControlName="mfaEnabled"></mat-slide-toggle>
                </div>
                <div>
                  <label class="ks-label">Session Timeout (minutes)</label>
                  <input type="number" formControlName="sessionTimeout" class="ks-input sm:w-48" />
                  <p class="text-xs text-slate-400 mt-1">Users are automatically signed out after this period of inactivity.</p>
                </div>
                <div>
                  <label class="ks-label">Allowed Email Domains</label>
                  <input formControlName="allowedDomains" class="ks-input" placeholder="company.com, partner.com" />
                  <p class="text-xs text-slate-400 mt-1">Comma-separated. Only these domains can self-register.</p>
                </div>
              </div>
            }

            <!-- ──────────────── NOTIFICATIONS ───────────────────── -->
            @if (activeSection() === 'notifications') {
              <div class="p-6 border-b border-slate-100">
                <h2 class="text-sm font-bold text-slate-800 mb-0.5">Notifications</h2>
                <p class="text-xs text-slate-400">Configure when and how KnowSphere sends notifications</p>
              </div>
              <div class="p-6 space-y-3" formGroupName="notifications">
                @for (n of notifOptions; track n.key) {
                  <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p class="text-sm font-medium text-slate-700">{{ n.label }}</p>
                      <p class="text-xs text-slate-400 mt-0.5">{{ n.desc }}</p>
                    </div>
                    <mat-slide-toggle color="primary" [formControlName]="n.key"></mat-slide-toggle>
                  </div>
                }
              </div>
            }

            <!-- ── Save bar ──────────────────────────────────────── -->
            <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-xl">
              <p class="text-xs text-slate-400">Changes are saved to the database and take effect immediately</p>
              <button type="submit" mat-flat-button color="primary" class="!rounded-lg !text-sm !px-6" [disabled]="saving()">
                <mat-icon class="!text-base mr-1">save</mat-icon>
                {{ saving() ? 'Saving…' : 'Save Settings' }}
              </button>
            </div>

          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    :host ::ng-deep .ks-label { display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    :host ::ng-deep .ks-input,
    .ks-input {
      width: 100%; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 8px 12px; font-size: 13px; color: #334155; outline: none;
      transition: border-color .15s, box-shadow .15s; background: white;
      font-family: 'Inter', sans-serif;
    }
    :host ::ng-deep .ks-input:focus, .ks-input:focus {
      border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1);
    }
  `]
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsService = inject(SettingsService);
  fb = inject(FormBuilder);
  activeSection = signal('general');
  saving = signal(false);
  modelFilter = signal<'all' | 'free' | 'paid' | 'recommended'>('all');
  form!: FormGroup;

  // ── Explicit signals for provider and model (updated on form changes) ──
  // Using signals instead of computed() because FormControl.value is NOT a signal
  _selectedProvider = signal<AIProvider>('openai');
  _selectedModel = signal<string>('gpt-4o');

  private formSub?: Subscription;

  // ── Plain getters that read from signals ─────────────────────────────────
  get selectedProvider(): AIProvider { return this._selectedProvider(); }
  get selectedModel(): string { return this._selectedModel(); }
  get activeModel() { return getModelByValue(this._selectedProvider(), this._selectedModel()); }
  get filteredModels() {
    const provider = this._selectedProvider();
    switch (this.modelFilter()) {
      case 'free':        return getFreeModels(provider);
      case 'paid':        return getPaidModels(provider);
      case 'recommended': return getRecommendedModels(provider);
      default:            return getActiveModels(provider);
    }
  }

  // ── Exposed utilities for template ──────────────────────────────────────
  formatContext = formatContext;
  formatPrice = formatPrice;
  getModelLimits = getModelLimits;

  // ── Static metadata ──────────────────────────────────────────────────────
  sections = [
    { key: 'general',       label: 'General',             icon: 'settings' },
    { key: 'ai',            label: 'AI Configuration',    icon: 'psychology' },
    { key: 'vector',        label: 'Vector DB',           icon: 'hub' },
    { key: 'processing',    label: 'Document Processing', icon: 'auto_fix_high' },
    { key: 'security',      label: 'Security',            icon: 'security' },
    { key: 'notifications', label: 'Notifications',       icon: 'notifications' }
  ];

  providerList = (['openai', 'gemini', 'openrouter'] as AIProvider[]).map(p => ({
    value: p, ...AI_PROVIDERS_META[p]
  }));

  modelTabs: { key: 'all' | 'free' | 'paid' | 'recommended'; label: string }[] = [
    { key: 'all',         label: 'All' },
    { key: 'free',        label: '🟢 Free' },
    { key: 'paid',        label: '🔵 Paid' },
    { key: 'recommended', label: '⭐ Recommended' }
  ];

  notifOptions = [
    { key: 'emailNotifications', label: 'Email Notifications',   desc: 'Receive notifications via email' },
    { key: 'processingComplete', label: 'Processing Complete',   desc: 'Alert when document RAG processing finishes' },
    { key: 'queryAlerts',        label: 'Query Alerts',          desc: 'Alert on unusual query patterns or errors' },
    { key: 'weeklyReport',       label: 'Weekly Usage Report',   desc: 'Receive weekly analytics summary every Monday' }
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Build form with cached defaults first (instant render)
    this.buildForm(this.settingsService.settings());
    // Then fetch from API and rebuild with real saved values
    this.settingsService.getSettings().subscribe({
      next: (settings: AppSettings) => {
        this.buildForm(settings);
      },
      error: () => {} // already handled in service with toast
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  // ── Form helpers ──────────────────────────────────────────────────────────
  f(path: string) { return this.form.get(path) as any; }

  private buildForm(s: AppSettings): void {
    this.formSub?.unsubscribe();

    const provider = (s.ai?.provider || 'openai') as AIProvider;
    const model = s.ai?.model || 'gpt-4o';

    this.form = this.fb.group({
      general: this.fb.group({
        appName:  [s.appName  || 'KnowSphere'],
        timezone: [s.timezone || 'Asia/Kolkata'],
        language: [s.language || 'en']
      }),
      ai: this.fb.group({
        provider:    [provider],
        model:       [model],
        temperature: [s.ai?.temperature ?? 0.2],
        maxTokens:   [s.ai?.maxTokens   || 2000]
      }),
      vectorDB: this.fb.group({
        url:        [s.vectorDB?.url        || 'http://localhost:6333'],
        collection: [s.vectorDB?.collection || 'knowledge-base']
      }),
      documentProcessing: this.fb.group({
        chunkSize:         [s.documentProcessing?.chunkSize         || 1000],
        chunkOverlap:      [s.documentProcessing?.chunkOverlap      || 150],
        topK:              [s.documentProcessing?.topK              || 5],
        minRelevanceScore: [s.documentProcessing?.minRelevanceScore || 0.7]
      }),
      security: this.fb.group({
        sessionTimeout: [s.security?.sessionTimeout || 30],
        mfaEnabled:     [s.security?.mfaEnabled     || false],
        allowedDomains: [(s.security?.allowedDomains || ['company.com']).join(', ')]
      }),
      notifications: this.fb.group({
        emailNotifications: [s.notifications?.emailNotifications ?? true],
        processingComplete: [s.notifications?.processingComplete  ?? true],
        queryAlerts:        [s.notifications?.queryAlerts         ?? false],
        weeklyReport:       [s.notifications?.weeklyReport        ?? true]
      })
    });

    // Seed signals from initial form values
    this._selectedProvider.set(provider);
    this._selectedModel.set(model);

    // Subscribe to form changes → update signals so template re-renders
    this.formSub = this.form.get('ai')!.valueChanges.subscribe(val => {
      if (val.provider) this._selectedProvider.set(val.provider as AIProvider);
      if (val.model)    this._selectedModel.set(val.model);
    });
  }

  setProvider(provider: string): void {
    const models = getActiveModels(provider as AIProvider);
    const first = models.find(m => m.recommended) ?? models[0];
    const firstValue = first?.value ?? '';
    // Update signals first (immediate UI feedback)
    this._selectedProvider.set(provider as AIProvider);
    this._selectedModel.set(firstValue);
    // Then patch form (triggers valueChanges but signals already correct)
    this.form.get('ai')?.patchValue({ provider, model: firstValue }, { emitEvent: false });
    this.modelFilter.set('all');
  }

  selectModel(value: string): void {
    this._selectedModel.set(value);
    this.form.get('ai')?.patchValue({ model: value }, { emitEvent: false });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();

    // Build AppSettings — intentionally NO apiKey fields anywhere
    const settings: AppSettings = {
      appName:  raw.general.appName,
      timezone: raw.general.timezone,
      language: raw.general.language,
      ai: {
        provider:    raw.ai.provider,
        model:       raw.ai.model,
        temperature: parseFloat(raw.ai.temperature),
        maxTokens:   parseInt(raw.ai.maxTokens, 10)
        // apiKey intentionally omitted
      },
      vectorDB: {
        provider:   'qdrant',
        url:        raw.vectorDB.url,
        collection: raw.vectorDB.collection
        // Qdrant API key stays in backend .env
      },
      documentProcessing: {
        chunkSize:         parseInt(raw.documentProcessing.chunkSize, 10),
        chunkOverlap:      parseInt(raw.documentProcessing.chunkOverlap, 10),
        topK:              parseInt(raw.documentProcessing.topK, 10),
        minRelevanceScore: parseFloat(raw.documentProcessing.minRelevanceScore)
      },
      security: {
        sessionTimeout: parseInt(raw.security.sessionTimeout, 10),
        mfaEnabled:     raw.security.mfaEnabled,
        allowedDomains: raw.security.allowedDomains
          .split(',').map((d: string) => d.trim()).filter(Boolean)
      },
      notifications: {
        emailNotifications: raw.notifications.emailNotifications,
        processingComplete: raw.notifications.processingComplete,
        queryAlerts:        raw.notifications.queryAlerts,
        weeklyReport:       raw.notifications.weeklyReport
      }
    };

    this.settingsService.saveSettings(settings).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false)
    });
  }
}
