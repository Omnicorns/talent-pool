import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_BASE } from './api-base';

const BACKOFFICE_KEY = 'sarinahBackofficeAuth';
const BACKOFFICE_EXPIRY_KEY = 'sarinahBackofficeAuthExpiry';
const BACKOFFICE_ROLE_KEY = 'sarinahBackofficeRole';

interface BackofficeLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class BackofficeAuthService {
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Menukar username dan password dengan token berumur pendek. Password tidak disimpan di browser;
   * yang disimpan hanya token yang kedaluwarsa otomatis.
   */
  login(username: string, password: string) {
    return this.http.post<BackofficeLoginResponse>(`${API_BASE}/backoffice/auth/login`, { username, password }).pipe(
      tap((response) => {
        sessionStorage.setItem(BACKOFFICE_KEY, `${response.tokenType} ${response.accessToken}`);
        sessionStorage.setItem(BACKOFFICE_EXPIRY_KEY, String(Date.now() + response.expiresIn * 1000));
        sessionStorage.setItem(BACKOFFICE_ROLE_KEY, response.role);
      })
    );
  }

  get authorization(): string | null {
    const value = sessionStorage.getItem(BACKOFFICE_KEY);
    if (!value) return null;
    const expiry = Number(sessionStorage.getItem(BACKOFFICE_EXPIRY_KEY));
    // Sesi lama (HTTP Basic) tidak punya waktu kedaluwarsa dan tidak lagi diterima server.
    if (!value.startsWith('Bearer ') || !expiry || Date.now() >= expiry) {
      this.clear();
      return null;
    }
    return value;
  }

  /** Akun pimpinan (VIEWER) hanya boleh membuka halaman ringkasan. Server tetap menegakkan aturan ini. */
  get isViewer(): boolean {
    return sessionStorage.getItem(BACKOFFICE_ROLE_KEY) === 'VIEWER';
  }

  get homeUrl(): string {
    return this.isViewer ? '/backoffice/ringkasan' : '/backoffice/dashboard';
  }

  logout(): void {
    this.clear();
    this.router.navigateByUrl('/backoffice/login');
  }

  private clear(): void {
    sessionStorage.removeItem(BACKOFFICE_KEY);
    sessionStorage.removeItem(BACKOFFICE_EXPIRY_KEY);
    sessionStorage.removeItem(BACKOFFICE_ROLE_KEY);
  }
}
