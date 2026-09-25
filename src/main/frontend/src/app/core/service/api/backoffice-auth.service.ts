import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_BASE } from './api-base';

const BACKOFFICE_KEY = 'sarinahBackofficeAuth';

@Injectable({ providedIn: 'root' })
export class BackofficeAuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    const authorization = 'Basic ' + btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ Authorization: authorization });

    return this.http.get(`${API_BASE}/backoffice/dashboard`, { headers }).pipe(
      tap(() => sessionStorage.setItem(BACKOFFICE_KEY, authorization))
    );
  }

  get authorization(): string | null {
    return sessionStorage.getItem(BACKOFFICE_KEY);
  }

  logout(): void {
    sessionStorage.removeItem(BACKOFFICE_KEY);
    this.router.navigateByUrl('/backoffice/login');
  }
}
