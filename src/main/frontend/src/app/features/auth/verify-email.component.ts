import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <main class="recovery">
      <section class="recovery-card">
        <a routerLink="/" aria-label="Beranda Sarinah Karier"><img class="logo" src="images/sarinah.png" alt="Sarinah"></a>

        <p class="muted" *ngIf="state === 'loading'" role="status">Memverifikasi email Anda…</p>

        <ng-container *ngIf="state === 'success'">
          <div class="alert alert-success" role="status">
            <app-icon name="check"></app-icon>
            <div><strong>Email berhasil diverifikasi</strong><p>Akun Anda sudah aktif. Silakan masuk untuk melengkapi profil.</p></div>
          </div>
          <a routerLink="/sign-in" class="btn btn-primary btn-lg btn-block">Masuk</a>
        </ng-container>

        <ng-container *ngIf="state === 'error'">
          <div>
            <h1>Verifikasi gagal</h1>
            <p>{{ error }}</p>
          </div>
          <a routerLink="/sign-in" class="btn btn-primary btn-lg btn-block">Masuk dan kirim ulang link</a>
          <p class="muted" style="font-size: 14px">Coba masuk dengan email dan password Anda. Jika email belum terverifikasi, kami akan menawarkan pengiriman ulang.</p>
        </ng-container>
      </section>
    </main>
  `,
})
export class VerifyEmailComponent implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';
  error = '';

  constructor(private route: ActivatedRoute, private auth: TalentAuthService) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!token) {
      this.fail('Link verifikasi tidak valid.');
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: () => this.state = 'success',
      error: (error) => this.fail(error?.error?.message || 'Link verifikasi tidak valid atau sudah kedaluwarsa.'),
    });
  }

  private fail(message: string): void {
    this.error = message;
    this.state = 'error';
  }
}
