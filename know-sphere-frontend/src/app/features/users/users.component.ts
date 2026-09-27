import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { UserEditDialogComponent } from '../../shared/components/user-edit-dialog/user-edit-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
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

      <!-- Add form -->
      @if (showAddForm()) {
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Add New User</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Full Name *</label>
              <input [(ngModel)]="newName" placeholder="Full name"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Email *</label>
              <input [(ngModel)]="newEmail" type="email" placeholder="email@company.com"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 mb-1 block">Department</label>
              <select [(ngModel)]="newDept"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Engineering</option><option>HR</option><option>Finance</option>
                <option>IT</option><option>Sales</option><option>Admin</option>
              </select>
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
              <button mat-flat-button (click)="addUser()" [disabled]="!newName || !newEmail"
                class="flex-1 !bg-indigo-600 !text-white !rounded-lg !text-sm">Add</button>
              <button mat-stroked-button (click)="showAddForm.set(false)"
                class="!border-slate-200 !text-slate-600 !rounded-lg !text-sm">Cancel</button>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-2">Default password: <span class="font-mono font-semibold">Welcome@123</span></p>
        </div>
      }

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 mb-5">
        <div class="flex-1 min-w-48 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <mat-icon class="!text-sm text-slate-400">search</mat-icon>
          <input [(ngModel)]="searchQuery" placeholder="Search users…"
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
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Department</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (user of filteredUsers(); track user.id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-xs font-bold text-indigo-700">{{ user.name.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-slate-700">{{ user.name }}</p>
                        <p class="text-xs text-slate-400 md:hidden">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{{ user.email }}</td>
                  <td class="px-4 py-3 hidden lg:table-cell">
                    <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{{ user.department || '—' }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
                      [class.bg-violet-100]="user.role === 'admin'"
                      [class.text-violet-700]="user.role === 'admin'"
                      [class.bg-slate-100]="user.role === 'user'"
                      [class.text-slate-600]="user.role === 'user'">
                      {{ user.role | titlecase }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      [class.bg-emerald-50]="user.status === 'active'"
                      [class.text-emerald-700]="user.status === 'active'"
                      [class.bg-slate-100]="user.status === 'inactive'"
                      [class.text-slate-500]="user.status === 'inactive'">
                      <span class="w-1.5 h-1.5 rounded-full"
                        [class.bg-emerald-500]="user.status === 'active'"
                        [class.bg-slate-400]="user.status === 'inactive'"></span>
                      {{ user.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell">{{ user.lastLogin }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-0.5">
                      <!-- Edit -->
                      <button (click)="editUser(user)"
                        class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        matTooltip="Edit user">
                        <mat-icon class="!text-[16px] leading-none">edit</mat-icon>
                      </button>
                      <!-- Toggle status -->
                      <button (click)="toggleStatus(user.id)"
                        class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        [class.text-slate-400]="user.status === 'active'"
                        [class.hover:text-orange-600]="user.status === 'active'"
                        [class.hover:bg-orange-50]="user.status === 'active'"
                        [class.text-slate-400]="user.status === 'inactive'"
                        [class.hover:text-emerald-600]="user.status === 'inactive'"
                        [class.hover:bg-emerald-50]="user.status === 'inactive'"
                        [matTooltip]="user.status === 'active' ? 'Deactivate' : 'Activate'">
                        <mat-icon class="!text-[16px] leading-none">{{ user.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>
                      </button>
                      <!-- Reset password -->
                      <button (click)="resetPassword(user.id)"
                        class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        matTooltip="Reset password">
                        <mat-icon class="!text-[16px] leading-none">lock_reset</mat-icon>
                      </button>
                      <!-- Delete -->
                      <button (click)="confirmDelete(user)"
                        class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        matTooltip="Delete user">
                        <mat-icon class="!text-[16px] leading-none">delete_outline</mat-icon>
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
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>{{ activeCount() }} active</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>{{ inactiveCount() }} inactive</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  userService = inject(UserService);
  dialog = inject(MatDialog);
  showAddForm = signal(false);
  searchQuery = ''; roleFilter = ''; statusFilter = '';
  newName = ''; newEmail = ''; newDept = 'Engineering'; newRole: 'admin' | 'user' = 'user';

  filteredUsers() {
    let u = this.userService.users();
    if (this.searchQuery) { const q = this.searchQuery.toLowerCase(); u = u.filter(x => x.name.toLowerCase().includes(q) || x.email.toLowerCase().includes(q)); }
    if (this.roleFilter) u = u.filter(x => x.role === this.roleFilter);
    if (this.statusFilter) u = u.filter(x => x.status === this.statusFilter);
    return u;
  }

  activeCount() { return this.userService.users().filter(u => u.status === 'active').length; }
  inactiveCount() { return this.userService.users().filter(u => u.status === 'inactive').length; }

  ngOnInit(): void { this.userService.loadUsers(); }

  addUser(): void {
    if (!this.newName || !this.newEmail) return;
    this.userService.addUser({ name: this.newName, email: this.newEmail, role: this.newRole, department: this.newDept }).subscribe({
      next: () => { this.newName = ''; this.newEmail = ''; this.newDept = 'Engineering'; this.showAddForm.set(false); },
      error: () => {}
    });
  }

  editUser(user: User): void {
    const ref = this.dialog.open(UserEditDialogComponent, {
      data: { user },
      width: '480px',
      panelClass: 'ks-dialog'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(user.id, result).subscribe();
      }
    });
  }

  toggleStatus(id: string): void { this.userService.toggleStatus(id); }
  resetPassword(id: string): void { this.userService.resetPassword(id); }

  confirmDelete(user: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.name}? This cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'warn',
        icon: 'person_remove'
      },
      width: '380px',
      panelClass: 'ks-dialog'
    });
    ref.afterClosed().subscribe(confirmed => { if (confirmed) this.userService.deleteUser(user.id); });
  }
}
