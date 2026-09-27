import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="password-recovery-page">
      <section class="password-recovery-card">
        <a routerLink="/sign-in" class="back-link">← Kembali ke Sign In</a>

        <div class="recovery-brand">
          <img src="images/sarinah.png" alt="Sarinah">
          <span>TALENT POOL</span>
        </div>

        <div class="recovery-icon">⌁</div>
        <h1>Buat Password Baru</h1>
        <p>Gunakan password minimal 8 karakter dan berbeda dari password sebelumnya.</p>

        <form *ngIf="!success" (ngSubmit)="submit()">
          <label>Password Baru
            <div class="password-field">
              <input
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="newPassword"
                name="newPassword"
                minlength="8"
                maxlength="72"
                autocomplete="new-password"
                required>
              <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                  <circle cx="12" cy="12" r="2.75"></circle>
                </svg>
                <svg *ngIf="showPassword" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18"></path>
                  <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a15.8 15.8 0 0 1-2.2 3"></path>
                  <path d="M6.6 6.7C4 8.3 2.5 12 2.5 12s3.5 6 9.5 6a9.9 9.9 0 0 0 3.4-.6"></path>
                </svg>
              </button>
            </div>
          </label>

          <label>Konfirmasi Password Baru
            <div class="password-field">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                minlength="8"
                maxlength="72"
                autocomplete="new-password"
                required>
              <button type="button" class="password-toggle" (click)="showConfirmPassword = !showConfirmPassword">
                <svg *ngIf="!showConfirmPassword" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                  <circle cx="12" cy="12" r="2.75"></circle>
                </svg>
                <svg *ngIf="showConfirmPassword" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18"></path>
                  <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a15.8 15.8 0 0 1-2.2 3"></path>
                  <path d="M6.6 6.7C4 8.3 2.5 12 2.5 12s3.5 6 9.5 6a9.9 9.9 0 0 0 3.4-.6"></path>
                </svg>
              </button>
            </div>
          </label>

          <button class="primary-button recovery-submit" [disabled]="loading || !token">
            {{ loading ? 'Menyimpan...' : 'Reset Password' }}
          </button>
        </form>

        <div class="recovery-success" *ngIf="success">
          <strong>Password berhasil diubah</strong>
          <p>Silakan masuk kembali menggunakan password baru Anda.</p>
          <a routerLink="/sign-in" class="primary-button recovery-submit">Sign In</a>
        </div>

        <p class="form-error" *ngIf="error">{{ error }}</p>
      </section>
    </main>
  `,
})
export class ResetPasswordComponent {
  token = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private auth: TalentAuthService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error = 'Link reset password tidak valid.';
    }
  }

  submit(): void {
    this.error = '';

    if (!this.token) {
      this.error = 'Link reset password tidak valid.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.error = 'Password baru minimal 8 karakter.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Konfirmasi password tidak sama.';
      return;
    }

    this.loading = true;
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message || 'Link reset password tidak valid atau sudah kedaluwarsa.';
      },
    });
  }
}
