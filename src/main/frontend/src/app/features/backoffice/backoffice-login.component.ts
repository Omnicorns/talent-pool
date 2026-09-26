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
                  {{ showPassword ? '🙈' : '👁' }}
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
