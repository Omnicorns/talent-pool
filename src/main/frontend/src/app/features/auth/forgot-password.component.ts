import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <main class="recovery">
      <section class="recovery-card">
        <a routerLink="/" aria-label="Beranda Sarinah Karier"><img class="logo" src="images/sarinah.png" alt="Sarinah"></a>

        <ng-container *ngIf="!submitted">
          <div>
            <h1>Atur ulang password</h1>
            <p>Masukkan email akun Anda. Jika terdaftar, kami kirimkan tautan untuk membuat password baru.</p>
          </div>
          <form class="form-stack" (ngSubmit)="submit()">
            <label class="field">Email
              <input type="email" [(ngModel)]="email" name="email" placeholder="nama@email.com" autocomplete="email" required>
            </label>
            <button class="btn btn-primary btn-lg btn-block" [disabled]="loading">{{ loading ? 'Mengirim…' : 'Kirim tautan' }}</button>
          </form>
        </ng-container>

        <ng-container *ngIf="submitted">
          <div class="alert alert-success" role="status">
            <app-icon name="mail"></app-icon>
            <div><strong>Periksa email Anda</strong><p>{{ message }}</p></div>
          </div>
          <a *ngIf="debugResetUrl" [href]="debugResetUrl" class="link">Buka tautan reset (mode debug)</a>
        </ng-container>

        <div class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>

        <a routerLink="/sign-in" class="back-link"><app-icon name="arrow-left" [size]="16"></app-icon> Kembali ke halaman masuk</a>
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
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Email reset gagal dikirim. Coba lagi nanti atau hubungi administrator.';
      },
    });
  }
}
