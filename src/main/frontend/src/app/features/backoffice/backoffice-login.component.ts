import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BackofficeAuthService } from '../../core/service/api/backoffice-auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-backoffice-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <main class="bo-login">
      <section class="bo-login-card">
        <img src="images/sarinah.png" alt="Sarinah" class="logo">
        <div>
          <h1>Masuk ke back office</h1>
          <p>Khusus tim Human Capital dan recruiter Sarinah.</p>
        </div>
        <form class="form-stack" (ngSubmit)="login()">
          <label class="field">Username<input [(ngModel)]="username" name="username" autocomplete="username" required></label>
          <label class="field">Password
            <span class="password-field">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" autocomplete="current-password" required>
              <button type="button" class="icon-btn" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                <app-icon [name]="showPassword ? 'eye-off' : 'eye'"></app-icon>
              </button>
            </span>
          </label>
          <div class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
          <button class="btn btn-primary btn-lg btn-block" [disabled]="loading">{{ loading ? 'Memeriksa…' : 'Masuk' }}</button>
        </form>
        <p class="bo-login-foot"><a routerLink="/" class="back-link"><app-icon name="arrow-left" [size]="16"></app-icon> Ke portal kandidat</a></p>
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
