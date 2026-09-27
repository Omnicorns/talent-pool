import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BackofficeAuthService } from '../../core/service/api/backoffice-auth.service';

@Component({
  selector: 'app-backoffice-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="backoffice-login">
      <section class="backoffice-brand-panel">
        <img src="images/sarinah.png" alt="Sarinah">
        <div>
          <small>HUMAN CAPITAL • TALENT POOL • RECRUITMENT</small>
          <h1>Kelola kandidat terbaik dalam satu tempat.</h1>
        </div>
      </section>
      <section class="backoffice-login-panel">
        <div class="login-card">
          <a routerLink="/" class="back-link">← Kembali ke portal kandidat</a>
          <img src="images/sarinah.png" alt="Sarinah" class="login-logo">
          <h2>Masuk Back Office</h2>
          <p>Gunakan akun Admin atau Recruiter.</p>
          <form (ngSubmit)="login()">
            <label>Username<input [(ngModel)]="username" name="username" required></label>
            <label>Password
              <div class="password-field">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required>
                <button type="button" class="password-toggle" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                  <svg *ngIf="!showPassword" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                    <circle cx="12" cy="12" r="2.75"></circle>
                  </svg>
                  <svg *ngIf="showPassword" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18"></path>
                    <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a15.8 15.8 0 0 1-2.2 3"></path>
                    <path d="M6.6 6.7C4 8.3 2.5 12 2.5 12s3.5 6 9.5 6a9.9 9.9 0 0 0 3.4-.6"></path>
                    <path d="M10.1 10.1a2.75 2.75 0 0 0 3.8 3.8"></path>
                  </svg>
                </button>
              </div>
            </label>
            <button class="primary-button" [disabled]="loading">{{ loading ? 'Memproses...' : 'Masuk' }}</button>
          </form>
          <p class="form-error" *ngIf="error">{{ error }}</p>
        </div>
      </section>
    </main>
  `,
})
export class BackofficeLoginComponent {
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private auth: BackofficeAuthService, private router: Router) {}

  login(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigateByUrl('/backoffice/dashboard'),
      error: () => {
        this.error = 'Username atau password tidak valid.';
        this.loading = false;
      },
    });
  }
}
