import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen flex">

      <!-- Left branded panel -->
      <div class="hidden lg:flex lg:w-5/12 bg-[#3730a3] flex-col justify-between p-10 relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full"></div>
          <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full"></div>
        </div>

        <div class="relative z-10">
          <!-- Logo -->
          <div class="flex items-center gap-3 mb-16">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <mat-icon class="text-white">hub</mat-icon>
            </div>
            <div>
              <p class="text-white font-bold text-lg leading-tight">KnowSphere</p>
              <p class="text-indigo-200 text-xs">Enterprise Knowledge Copilot</p>
            </div>
          </div>

          <!-- Hero text -->
          <div class="mb-12">
            <h1 class="text-4xl font-bold text-white leading-tight mb-4">
              Ask, Search and<br>Find Answers
            </h1>
            <p class="text-indigo-200 text-lg leading-relaxed">
              from your company knowledge
            </p>
          </div>

          <!-- Features -->
          <div class="space-y-4">
            @for (feature of features; track feature.text) {
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <mat-icon class="!text-sm text-white">check</mat-icon>
                </div>
                <span class="text-indigo-100 text-sm">{{ feature.text }}</span>
              </div>
            }
          </div>
        </div>

        <div class="relative z-10">
          <p class="text-indigo-300 text-xs">© 2026 KnowSphere. All rights reserved.</p>
        </div>
      </div>

      <!-- Right login form -->
      <div class="flex-1 flex items-center justify-center p-8 bg-white">
        <div class="w-full max-w-sm">

          <!-- Mobile logo -->
          <div class="flex items-center gap-2 mb-8 lg:hidden">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <mat-icon class="!text-white !text-base">hub</mat-icon>
            </div>
            <span class="font-bold text-slate-800">KnowSphere</span>
          </div>

          <h2 class="text-2xl font-bold text-slate-900 mb-1">Welcome Back</h2>
          <p class="text-slate-500 text-sm mb-8">Sign in to continue</p>

          <!-- Error banner -->
          @if (errorMsg()) {
            <div class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
              <mat-icon class="!text-base text-red-500 flex-shrink-0">error_outline</mat-icon>
              <span class="text-sm text-red-600">{{ errorMsg() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2">
                  <mat-icon class="!text-base text-slate-400">mail_outline</mat-icon>
                </span>
                <input
                  formControlName="email"
                  type="email"
                  placeholder="you@company.com"
                  class="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  [class.border-red-300]="isInvalid('email')" />
              </div>
              @if (isInvalid('email')) {
                <p class="text-xs text-red-500 mt-1">
                  {{ form.get('email')?.hasError('required') ? 'Email is required' : 'Enter a valid email' }}
                </p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2">
                  <mat-icon class="!text-base text-slate-400">lock_outline</mat-icon>
                </span>
                <input
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  [class.border-red-300]="isInvalid('password')" />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <mat-icon class="!text-base">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (isInvalid('password')) {
                <p class="text-xs text-red-500 mt-1">Password is required</p>
              }
            </div>

            <div class="flex justify-end">
              <button type="button" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot password?
              </button>
            </div>

            <!-- Submit -->
            <button
              mat-flat-button
              type="submit"
              [disabled]="loading()"
              class="w-full !bg-indigo-600 hover:!bg-indigo-700 !text-white !py-6 !rounded-lg !text-sm !font-semibold">
              @if (loading()) {
                <mat-spinner diameter="18" class="mr-2 inline-block"></mat-spinner>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-xs text-slate-400 font-medium">OR</span>
            <div class="flex-1 h-px bg-slate-200"></div>
          </div>

          <!-- Google -->
          <button
            mat-stroked-button
            class="w-full !border-slate-200 !text-slate-700 !py-5 !rounded-lg !text-sm !font-medium">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-4 h-4 mr-2 inline">
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  features = [
    { text: 'Secure & Private' },
    { text: 'AI Powered Search' },
    { text: 'Find Answers Instantly' },
    { text: 'Source References' }
  ];

  form = this.fb.group({
    email: ['admin@company.com', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required]]
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: () => { this.loading.set(false); this.errorMsg.set('Invalid email or password.'); }
    });
  }
}
