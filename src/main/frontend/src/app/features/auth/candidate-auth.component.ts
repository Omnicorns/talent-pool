import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';

@Component({
  selector: 'app-candidate-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-visual">
        <img src="/images/sarinah.png" class="auth-brand" alt="Sarinah">
        <div>
          <span>SARINAH CAREER</span>
          <h1>{{ mode === 'login' ? 'Continue your career journey.' : 'Build your career journey with Sarinah.' }}</h1>
          <p>Kelola profil Talent Pool, lamaran, pengalaman, dan perkembangan karier Anda dalam satu portal.</p>
        </div>
      </section>

      <section class="auth-panel">
        <a routerLink="/" class="back-link">← Kembali ke Home</a>
        <div class="auth-tabs">
          <button [class.active]="mode === 'login'" (click)="mode='login'">Sign In</button>
          <button [class.active]="mode === 'register'" (click)="mode='register'">Create Account</button>
        </div>

        <div *ngIf="mode === 'login'">
          <h2>Sign In</h2>
          <p class="muted">Masuk menggunakan akun kandidat Anda.</p>
          <form (ngSubmit)="login()">
            <label>Email<input type="email" [(ngModel)]="email" name="email" required></label>
            <label>Password<input type="password" [(ngModel)]="password" name="password" minlength="8" required></label>
            <button class="primary-button" [disabled]="loading">{{ loading ? 'Memproses...' : 'Sign In →' }}</button>
          </form>
        </div>

        <div *ngIf="mode === 'register'">
          <h2>Create Candidate Account</h2>
          <p class="muted">Buat akun untuk mengelola profil dan lamaran Anda.</p>
          <form (ngSubmit)="register()">
            <label>Nama Lengkap<input [(ngModel)]="fullName" name="fullName" required></label>
            <div class="two-col">
              <label>Email<input type="email" [(ngModel)]="email" name="registerEmail" required></label>
              <label>WhatsApp<input [(ngModel)]="phone" name="phone" required></label>
            </div>
            <label>Password<input type="password" [(ngModel)]="password" name="registerPassword" minlength="8" required></label>
            <label class="checkbox"><input type="checkbox" [(ngModel)]="termsAccepted" name="termsAccepted"> Saya menyetujui penggunaan data untuk proses rekrutmen.</label>
            <button class="primary-button" [disabled]="loading">{{ loading ? 'Memproses...' : 'Create Account →' }}</button>
          </form>
        </div>

        <p class="form-error" *ngIf="error">{{ error }}</p>
      </section>
    </main>
  `,
})
export class CandidateAuthComponent {
  mode: 'login' | 'register' = location.pathname.endsWith('/register') ? 'register' : 'login';
  fullName = '';
  email = '';
  phone = '';
  password = '';
  termsAccepted = false;
  loading = false;
  error = '';

  constructor(private auth: TalentAuthService, private router: Router) {}

  login(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: () => this.router.navigateByUrl('/portal'),
      error: (error) => {
        this.error = error?.error?.message || 'Sign in gagal.';
        this.loading = false;
      },
    });
  }

  register(): void {
    if (!this.termsAccepted) {
      this.error = 'Persetujuan penggunaan data wajib dicentang.';
      return;
    }
    this.error = '';
    this.loading = true;
    this.auth.register({
      fullName: this.fullName.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      password: this.password,
      termsAccepted: true,
    }).subscribe({
      next: () => this.router.navigateByUrl('/portal'),
      error: (error) => {
        this.error = error?.error?.message || 'Pembuatan akun gagal.';
        this.loading = false;
      },
    });
  }
}
