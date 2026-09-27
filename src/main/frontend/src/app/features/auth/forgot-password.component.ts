import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';

@Component({
  selector: 'app-forgot-password',
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

        <div class="recovery-icon">✉</div>
        <h1>Lupa Password?</h1>
        <p>
          Masukkan email yang terdaftar. Jika akun ditemukan, kami akan mengirimkan
          link untuk membuat password baru.
        </p>

        <form *ngIf="!submitted" (ngSubmit)="submit()">
          <label>Email
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="nama@email.com"
              autocomplete="email"
              required>
          </label>

          <button class="primary-button recovery-submit" [disabled]="loading">
            {{ loading ? 'Mengirim...' : 'Kirim Link Reset Password' }}
          </button>
        </form>

        <div class="recovery-success" *ngIf="submitted">
          <strong>Periksa email Anda</strong>
          <p>{{ message }}</p>

          <a
            *ngIf="debugResetUrl"
            [href]="debugResetUrl"
            class="debug-reset-link">
            Buka link reset (debug)
          </a>

          <a routerLink="/sign-in" class="primary-button recovery-submit">Kembali ke Sign In</a>
        </div>

        <p class="form-error" *ngIf="error">{{ error }}</p>
      </section>
    </main>
  `,
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  submitted = false;
  message = '';
  error = '';
  debugResetUrl: string | null = null;

  constructor(private auth: TalentAuthService) {}

  submit(): void {
    this.error = '';

    if (!this.email.trim()) {
      this.error = 'Email wajib diisi.';
      return;
    }

    this.loading = true;
    this.auth.forgotPassword(this.email.trim().toLowerCase()).subscribe({
      next: (response) => {
        this.loading = false;
        this.submitted = true;
        this.message = response.message;
        this.debugResetUrl = response.resetUrl || null;
      },
      error: () => {
        this.loading = false;
        this.submitted = true;
        this.message = 'Jika email terdaftar, instruksi reset password akan dikirimkan.';
      },
    });
  }
}
