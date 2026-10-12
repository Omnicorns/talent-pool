import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <main class="recovery">
      <section class="recovery-card">
        <a routerLink="/" aria-label="Beranda Sarinah Karier"><img class="logo" src="images/sarinah.png" alt="Sarinah"></a>

        <ng-container *ngIf="!success">
          <div>
            <h1>Buat password baru</h1>
            <p>Gunakan minimal 8 karakter dan berbeda dari password sebelumnya.</p>
          </div>
          <form class="form-stack" (ngSubmit)="submit()">
            <label class="field">Password baru
              <span class="password-field">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="newPassword" name="newPassword" minlength="8" maxlength="72" autocomplete="new-password" required>
                <button type="button" class="icon-btn" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'"></app-icon>
                </button>
              </span>
            </label>
            <label class="field">Ulangi password baru
              <span class="password-field">
                <input [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" minlength="8" maxlength="72" autocomplete="new-password" required>
                <button type="button" class="icon-btn" (click)="showConfirmPassword = !showConfirmPassword" [attr.aria-label]="showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                  <app-icon [name]="showConfirmPassword ? 'eye-off' : 'eye'"></app-icon>
                </button>
              </span>
            </label>
            <button class="btn btn-primary btn-lg btn-block" [disabled]="loading || !token">{{ loading ? 'Menyimpan…' : 'Simpan password' }}</button>
          </form>
        </ng-container>

        <ng-container *ngIf="success">
          <div class="alert alert-success" role="status">
            <app-icon name="check"></app-icon>
            <div><strong>Password berhasil diubah</strong><p>Silakan masuk dengan password baru Anda.</p></div>
          </div>
          <a routerLink="/sign-in" class="btn btn-primary btn-lg btn-block">Masuk</a>
        </ng-container>

        <div class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>

        <a *ngIf="!success" routerLink="/sign-in" class="back-link"><app-icon name="arrow-left" [size]="16"></app-icon> Kembali ke halaman masuk</a>
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
