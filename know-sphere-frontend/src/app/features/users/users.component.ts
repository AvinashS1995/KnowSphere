import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="page-header mb-0">
          <h1>Users</h1>
          <p>Manage system users and access</p>
        </div>
        <button mat-flat-button (click)="showAddForm.set(!showAddForm())"
          class="!bg-indigo-600 !text-white !rounded-lg !text-sm">
          <mat-icon class="!text-base mr-1">person_add</mat-icon> Add User
        </button>
      </div>

      <!-- Add user form -->
      @if (showAddForm()) {
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Add New User</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Full Name</label>
              <input [(ngModel)]="newName" placeholder="John Doe"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <input [(ngModel)]="newEmail" type="email" placeholder="john@company.com"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Role</label>
              <select [(ngModel)]="newRole"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex items-end gap-2">
              <button mat-flat-button (click)="addUser()"
                class="flex-1 !bg-indigo-600 !text-white !rounded-lg !text-sm">Add</button>
              <button mat-stroked-button (click)="showAddForm.set(false)"
                class="!border-slate-200 !text-slate-600 !rounded-lg !text-sm">Cancel</button>
            </div>
          </div>
        </div>
      }

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex-1 min-w-48 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <mat-icon class="!text-sm text-slate-400">search</mat-icon>
          <input [(ngModel)]="searchQuery" placeholder="Search users..."
            class="flex-1 text-sm text-slate-700 outline-none placeholder-slate-400 bg-transparent" />
        </div>
        <select [(ngModel)]="roleFilter"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select [(ngModel)]="statusFilter"
          class="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (user of filteredUsers(); track user.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-semibold text-indigo-700">{{ user.name.charAt(0) }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-slate-700">{{ user.name }}</p>
                        <p class="text-xs text-slate-400 md:hidden">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{{ user.email }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2.5 py-1 rounded-full font-medium"
                      [class.bg-violet-100]="user.role === 'admin'"
                      [class.text-violet-700]="user.role === 'admin'"
                      [class.bg-slate-100]="user.role === 'user'"
                      [class.text-slate-600]="user.role === 'user'">
                      {{ user.role | titlecase }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="status-badge {{ user.status }}">
                      <span class="w-1.5 h-1.5 rounded-full inline-block mr-1"
                        [class.bg-emerald-500]="user.status === 'active'"
                        [class.bg-slate-400]="user.status === 'inactive'"></span>
                      {{ user.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">{{ user.lastLogin }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      <button mat-icon-button matTooltip="Edit" class="!w-7 !h-7 !text-slate-400 hover:!text-indigo-600">
                        <mat-icon class="!text-base">edit</mat-icon>
                      </button>
                      <button mat-icon-button [matTooltip]="user.status === 'active' ? 'Deactivate' : 'Activate'"
                        class="!w-7 !h-7 !text-slate-400 hover:!text-indigo-600"
                        (click)="toggleStatus(user.id)">
                        <mat-icon class="!text-base">{{ user.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                      <button mat-icon-button matTooltip="Reset Password"
                        class="!w-7 !h-7 !text-slate-400 hover:!text-indigo-600"
                        (click)="resetPassword(user.id)">
                        <mat-icon class="!text-base">lock_reset</mat-icon>
                      </button>
                      <button mat-icon-button matTooltip="Delete"
                        class="!w-7 !h-7 !text-red-300 hover:!text-red-600"
                        (click)="deleteUser(user.id)">
                        <mat-icon class="!text-base">delete_outline</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
          <span>{{ filteredUsers().length }} users total</span>
          <span>{{ activeCount() }} active · {{ inactiveCount() }} inactive</span>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  userService = inject(UserService);
  showAddForm = signal(false);
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';
  newName = '';
  newEmail = '';
  newRole: 'admin' | 'user' = 'user';

  filteredUsers() {
    let users = this.userService.users();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (this.roleFilter) users = users.filter(u => u.role === this.roleFilter);
    if (this.statusFilter) users = users.filter(u => u.status === this.statusFilter);
    return users;
  }

  activeCount() { return this.userService.users().filter(u => u.status === 'active').length; }
  inactiveCount() { return this.userService.users().filter(u => u.status === 'inactive').length; }

  addUser(): void {
    if (!this.newName || !this.newEmail) return;
    this.userService.addUser({ name: this.newName, email: this.newEmail, role: this.newRole }).subscribe({
      next: () => { this.newName = ''; this.newEmail = ''; this.showAddForm.set(false); },
      error: () => {}
    });
  }

  toggleStatus(id: string): void { this.userService.toggleStatus(id); }
  deleteUser(id: string): void { this.userService.deleteUser(id); }
  resetPassword(id: string): void { this.userService.resetPassword(id); }
  ngOnInit(): void {
    this.userService.loadUsers();
  }
}
