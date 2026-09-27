import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6 w-full max-w-md">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-sm font-bold text-slate-800">Edit User</h3>
        <button (click)="dialogRef.close()" class="text-slate-400 hover:text-slate-600">
          <mat-icon class="!text-lg">close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
        <!-- Avatar preview -->
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
            {{ form.value.name?.charAt(0) || data.user.name.charAt(0) }}
          </div>
          <div>
            <p class="text-xs text-slate-500">Editing profile</p>
            <p class="text-sm font-medium text-slate-700">{{ data.user.email }}</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
          <input formControlName="name"
            class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            [class.border-red-300]="form.get('name')?.invalid && form.get('name')?.touched" />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-xs text-red-500 mt-1">Name is required</p>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
          <input formControlName="email" type="email"
            class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            [class.border-red-300]="form.get('email')?.invalid && form.get('email')?.touched" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
            <select formControlName="role"
              class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
            <select formControlName="status"
              class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Department</label>
          <select formControlName="department"
            class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="IT">IT</option>
            <option value="Sales">Sales</option>
            <option value="Admin">Admin</option>
            <option value="Legal">Legal</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" mat-stroked-button class="!border-slate-200 !text-slate-600 !rounded-lg !text-sm"
            (click)="dialogRef.close()">Cancel</button>
          <button type="submit" mat-flat-button color="primary" class="!rounded-lg !text-sm"
            [disabled]="form.invalid">
            <mat-icon class="!text-sm mr-1">save</mat-icon> Save Changes
          </button>
        </div>
      </form>
    </div>
  `
})
export class UserEditDialogComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.form = this.fb.group({
      name: [this.data.user.name, [Validators.required, Validators.minLength(2)]],
      email: [this.data.user.email, [Validators.required, Validators.email]],
      role: [this.data.user.role],
      status: [this.data.user.status],
      department: [this.data.user.department || 'Engineering']
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.dialogRef.close(this.form.value);
  }
}
