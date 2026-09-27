import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private base = `${environment.apiUrl}/users`;

  private _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  loadUsers(): void {
    this.http.get<{ success: boolean; users: any[] }>(this.base).subscribe({
      next: res => this._users.set((res.users ?? []).map(this.mapUser)),
      error: err => this.toast.error(err?.error?.message ?? 'Failed to load users')
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<{ success: boolean; users: any[] }>(this.base).pipe(
      map(res => (res.users ?? []).map(this.mapUser)),
      tap(users => this._users.set(users)),
      catchError(err => { this.toast.error(err?.error?.message ?? 'Failed to load users'); return throwError(() => err); })
    );
  }

  addUser(data: Partial<User>): Observable<User> {
    return this.http.post<{ success: boolean; user: any }>(this.base, {
      name: data.name, email: data.email, role: data.role ?? 'user', department: data.department
    }).pipe(
      map(res => this.mapUser(res.user)),
      tap(user => this._users.update(u => [...u, user])),
      tap(() => this.toast.success('User created successfully')),
      catchError(err => { this.toast.error(err?.error?.message ?? 'Failed to create user'); return throwError(() => err); })
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    return this.http.put<{ success: boolean; user: any }>(`${this.base}/${id}`, updates).pipe(
      map(res => this.mapUser(res.user)),
      tap(user => this._users.update(u => u.map(x => x.id === id ? user : x))),
      tap(() => this.toast.success('User updated')),
      catchError(err => { this.toast.error(err?.error?.message ?? 'Failed to update'); return throwError(() => err); })
    );
  }

  toggleStatus(id: string): void {
    this.http.patch<{ success: boolean; status: string }>(`${this.base}/${id}/status`, {}).subscribe({
      next: res => {
        this._users.update(u => u.map(x =>
          x.id === id ? { ...x, status: res.status as 'active' | 'inactive' } : x
        ));
        this.toast.success('Status updated');
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to update status')
    });
  }

  resetPassword(id: string): void {
    this.http.post(`${this.base}/${id}/reset-password`, {}).subscribe({
      next: () => this.toast.success('Password reset to Welcome@123'),
      error: err => this.toast.error(err?.error?.message ?? 'Failed to reset password')
    });
  }

  deleteUser(id: string): void {
    this.http.delete(`${this.base}/${id}`).subscribe({
      next: () => {
        this._users.update(u => u.filter(x => x.id !== id));
        this.toast.success('User deleted');
      },
      error: err => this.toast.error(err?.error?.message ?? 'Failed to delete user')
    });
  }

  private mapUser = (u: any): User => ({
    id: u._id ?? u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    department: u.department,
    avatar: u.avatar,
    lastLogin: u.lastLogin
      ? new Date(u.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
    createdAt: u.createdAt
  });
}
