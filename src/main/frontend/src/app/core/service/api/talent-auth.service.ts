import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { TalentSession } from '../../models/talent.models';

const SESSION_KEY = 'sarinahCandidateSession';

@Injectable({ providedIn: 'root' })
export class TalentAuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<TalentSession> {
    return this.http.post<TalentSession>('/api/talent/auth/login', { email, password })
      .pipe(tap((session) => this.saveSession(session)));
  }

  register(payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    termsAccepted: boolean;
  }): Observable<TalentSession> {
    return this.http.post<TalentSession>('/api/talent/auth/register', payload)
      .pipe(tap((session) => this.saveSession(session)));
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.patch('/api/talent/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  get session(): TalentSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) as TalentSession : null;
    } catch {
      return null;
    }
  }

  get token(): string | null {
    return this.session?.accessToken ?? null;
  }

  get authenticated(): boolean {
    return !!this.token;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.router.navigateByUrl('/');
  }

  private saveSession(session: TalentSession): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}
