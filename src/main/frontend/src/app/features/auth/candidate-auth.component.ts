import { inject } from '@angular/core';
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { Branding, DEFAULT_BRANDING, SiteContentService } from '../../core/service/api/site-content.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-candidate-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <main class="auth">
      <section class="auth-aside">
        <img class="bg" [src]="b.loginImage" alt="">
        <a routerLink="/" aria-label="Beranda Sarinah Karier"><img class="logo" [src]="b.brandLogo" alt="Sarinah"></a>
        <div>
          <h1>{{ b.login.title }}</h1>
          <p>{{ b.login.subtitle }}</p>
        </div>
      </section>

      <section class="auth-main">
        <div class="auth-card">
          <a routerLink="/" class="back-link"><app-icon name="arrow-left" [size]="16"></app-icon> Kembali ke beranda</a>

          <div class="check-email" *ngIf="pendingEmail; else authForms" role="status">
            <span class="check-email-icon"><app-icon name="mail" [size]="28"></app-icon></span>
            <h2>Cek email Anda</h2>
            <p>{{ pendingMessage }}</p>
            <p class="muted">Klik link di email tersebut untuk mengaktifkan akun. Link berlaku 24 jam.</p>
            <button type="button" class="btn btn-secondary btn-block" (click)="resend(pendingEmail)" [disabled]="resending || cooldown > 0">
              {{ resending ? 'Mengirim…' : cooldown > 0 ? 'Kirim ulang dalam ' + cooldown + ' detik' : 'Kirim ulang email verifikasi' }}
            </button>
            <p class="alert alert-success" *ngIf="info" role="status"><app-icon name="check"></app-icon><span>{{ info }}</span></p>
            <p class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></p>
            <button type="button" class="btn btn-ghost btn-block" (click)="backToLogin()">Sudah verifikasi? Masuk</button>
          </div>

          <ng-template #authForms>
          <div class="segmented" role="tablist" aria-label="Pilih masuk atau daftar">
            <button type="button" role="tab" [attr.aria-selected]="mode === 'login'" [class.active]="mode === 'login'" (click)="mode = 'login'; error = ''; unverifiedEmail = ''">Masuk</button>
            <button type="button" role="tab" [attr.aria-selected]="mode === 'register'" [class.active]="mode === 'register'" (click)="mode = 'register'; error = ''; unverifiedEmail = ''">Daftar</button>
          </div>

          <div *ngIf="mode === 'login'">
            <h2>Masuk ke akun Anda</h2>
            <p>Gunakan email dan password akun kandidat.</p>
          </div>
          <div *ngIf="mode === 'register'">
            <h2>Buat akun kandidat</h2>
            <p>Satu akun untuk profil Talent Pool dan semua lamaran Anda.</p>
          </div>

          <form *ngIf="mode === 'login'" class="form-stack" (ngSubmit)="login()">
            <label class="field">Email
              <span class="lead-field"><app-icon name="mail" [size]="18"></app-icon><input type="email" [(ngModel)]="email" name="email" autocomplete="email" placeholder="nama@email.com" required></span>
            </label>
            <label class="field">Password
              <span class="password-field lead-field"><app-icon name="shield" [size]="18"></app-icon>
                <input [type]="showPassword ? 'text' : 'password'" placeholder="Masukkan password" [(ngModel)]="password" name="password" autocomplete="current-password" minlength="8" required>
                <button type="button" class="icon-btn" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'"></app-icon>
                </button>
              </span>
            </label>
            <div class="auth-row"><a class="link" routerLink="/forgot-password">Lupa password?</a></div>
            <button class="btn btn-primary btn-lg btn-block" [disabled]="loading">{{ loading ? 'Memproses…' : 'Masuk' }}</button>
          </form>

          <form *ngIf="mode === 'register'" class="form-stack" (ngSubmit)="requestRegister()">
            <label class="field">Nama lengkap
              <span class="lead-field"><app-icon name="users" [size]="18"></app-icon><input [(ngModel)]="fullName" name="fullName" autocomplete="name" placeholder="Masukkan nama lengkap Anda" required></span>
            </label>
            <div class="form-grid">
              <label class="field">Email
                <span class="lead-field"><app-icon name="mail" [size]="18"></app-icon><input type="email" [(ngModel)]="email" name="registerEmail" autocomplete="email" placeholder="nama@email.com" required></span>
              </label>
              <label class="field">Nomor WhatsApp
                <span class="lead-field"><app-icon name="phone" [size]="18"></app-icon><input type="tel" [(ngModel)]="phone" name="phone" autocomplete="tel" inputmode="numeric" placeholder="08xxxxxxxxxx" required></span>
              </label>
            </div>
            <label class="field">Password
              <span class="password-field lead-field"><app-icon name="shield" [size]="18"></app-icon>
                <input [type]="showPassword ? 'text' : 'password'" placeholder="Minimal 8 karakter" [(ngModel)]="password" name="registerPassword" autocomplete="new-password" minlength="8" required>
                <button type="button" class="icon-btn" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Sembunyikan password' : 'Tampilkan password'">
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'"></app-icon>
                </button>
              </span>
              <small>Minimal 8 karakter.</small>
            </label>
            <label class="check"><input type="checkbox" [(ngModel)]="termsAccepted" name="termsAccepted"> Saya menyetujui penggunaan data saya untuk proses rekrutmen.</label>
            <button class="btn btn-primary btn-lg btn-block" [disabled]="loading">{{ loading ? 'Memproses…' : 'Buat akun' }}</button>
          </form>

          <p class="switch-mode" *ngIf="mode === 'login'">Belum punya akun? <button type="button" class="link" (click)="mode = 'register'; error = ''; unverifiedEmail = ''">Daftar di sini <app-icon name="arrow-up-right" [size]="14"></app-icon></button></p>
          <p class="switch-mode" *ngIf="mode === 'register'">Sudah punya akun? <button type="button" class="link" (click)="mode = 'login'; error = ''; unverifiedEmail = ''">Masuk <app-icon name="arrow-up-right" [size]="14"></app-icon></button></p>

          <div class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
          <div class="alert alert-info" *ngIf="unverifiedEmail" role="status">
            <app-icon name="mail"></app-icon>
            <div>
              <p>Belum menerima email? Kami bisa mengirim ulang link verifikasi ke <span style="font-weight: 650">{{ unverifiedEmail }}</span>.</p>
              <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 8px" (click)="resend(unverifiedEmail)" [disabled]="resending || cooldown > 0">
                {{ resending ? 'Mengirim…' : cooldown > 0 ? 'Kirim ulang dalam ' + cooldown + ' detik' : 'Kirim ulang email verifikasi' }}
              </button>
              <p *ngIf="info" style="margin-top: 8px">{{ info }}</p>
            </div>
          </div>
          </ng-template>
        </div>
      </section>

      <div class="modal-backdrop" *ngIf="termsModalOpen" (click)="closeTermsOnBackdrop($event)">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
          <header class="drawer-head">
            <div>
              <h2 id="terms-title">Syarat penggunaan data untuk rekrutmen</h2>
              <p>Mohon dibaca sebelum membuat akun.</p>
            </div>
            <button type="button" class="icon-btn" (click)="closeTermsModal()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>

          <div class="modal-body">
            <p>
              Dengan menyetujui syarat dan ketentuan ini, Anda memberikan izin kepada
              <strong>PT Sarinah (Persero)</strong> untuk memproses data pribadi Anda
              yang telah dikirimkan sehubungan dengan proses rekrutmen. Berikut adalah ketentuan penggunaannya:
            </p>

            <h3>1. Data yang dikumpulkan</h3>
            <p>Kami dapat mengumpulkan dan memproses informasi pribadi Anda, termasuk namun tidak terbatas pada:</p>
            <ul>
              <li>Nama lengkap.</li>
              <li>Informasi kontak seperti alamat email, nomor telepon, dan alamat rumah.</li>
              <li>Data profesional seperti riwayat pendidikan, pengalaman kerja, sertifikasi, dan keahlian.</li>
              <li>Dokumen yang relevan seperti CV, portofolio, dan surat lamaran.</li>
            </ul>

            <h3>2. Tujuan penggunaan data</h3>
            <p>Data Anda akan digunakan untuk:</p>
            <ul>
              <li>Menilai kecocokan Anda dengan posisi pekerjaan yang dilamar.</li>
              <li>Menghubungi Anda selama proses rekrutmen.</li>
              <li>Menyimpan informasi untuk pertimbangan pada lowongan pekerjaan lain yang relevan, jika diizinkan.</li>
            </ul>

            <h3>3. Penyimpanan data</h3>
            <p>
              Data Anda akan disimpan selama 2 tahun setelah akhir proses rekrutmen, kecuali jika Anda meminta
              penghapusan lebih awal. Data akan dihapus atau dianonimkan jika tidak lagi diperlukan.
            </p>

            <h3>4. Pembagian data</h3>
            <p>Data Anda dapat dibagikan dengan pihak yang terkait dengan proses rekrutmen, termasuk:</p>
            <ul>
              <li>Tim rekrutmen internal atau konsultan rekrutmen pihak ketiga.</li>
            </ul>
            <p>
              Kami tidak akan menjual atau memberikan data Anda kepada pihak lain untuk tujuan pemasaran tanpa
              persetujuan Anda.
            </p>

            <h3>5. Hak Anda</h3>
            <p>Anda memiliki hak sebagai berikut:</p>
            <ul>
              <li><strong>Hak Akses:</strong> meminta salinan data pribadi yang kami simpan.</li>
              <li><strong>Hak Koreksi:</strong> memperbaiki data pribadi yang tidak akurat.</li>
              <li><strong>Hak Penghapusan:</strong> meminta penghapusan data pribadi Anda dalam batas hukum yang berlaku.</li>
              <li><strong>Hak Keberatan:</strong> menarik persetujuan kapan saja tanpa memengaruhi sahnya pemrosesan sebelum penarikan.</li>
            </ul>
            <p>Permintaan terkait hak Anda dapat diajukan melalui email atau nomor kontak perusahaan.</p>

            <h3>6. Keamanan data</h3>
            <p>
              Kami berkomitmen untuk melindungi data pribadi Anda dengan menerapkan langkah-langkah keamanan fisik,
              teknis, dan administratif sesuai standar industri.
            </p>

            <h3>7. Persetujuan</h3>
            <p>Dengan mengirimkan aplikasi Anda, Anda menyatakan bahwa:</p>
            <ul>
              <li>Data yang diberikan adalah benar dan akurat.</li>
              <li>Anda memberikan persetujuan kepada Perusahaan untuk memproses data pribadi Anda sebagaimana diuraikan dalam syarat dan ketentuan ini.</li>
            </ul>

            <h3>8. Perubahan kebijakan</h3>
            <p>
              Kami dapat memperbarui kebijakan ini sewaktu-waktu. Anda akan diberitahu melalui email atau
              pengumuman di situs web kami mengenai perubahan tersebut.
            </p>
            <p>
              PT Sarinah (Persero) berkomitmen mematuhi ketentuan
              <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi</strong>.
            </p>
          </div>

          <footer class="modal-foot">
            <label class="check">
              <input type="checkbox" [(ngModel)]="termsConfirmed" name="termsConfirmed">
              <span>Saya telah membaca dan menyetujui syarat ini.</span>
            </label>
            <div class="button-row">
              <button type="button" class="btn btn-secondary" (click)="closeTermsModal()" [disabled]="loading">Batal</button>
              <button type="button" class="btn btn-primary" (click)="confirmTermsAndRegister()" [disabled]="!termsConfirmed || loading">
                {{ loading ? 'Membuat akun…' : 'Setuju & buat akun' }}
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  `,
})
export class CandidateAuthComponent implements OnDestroy {
  b: Branding = DEFAULT_BRANDING;
  private readonly brandingSub = inject(SiteContentService).branding().subscribe((branding) => (this.b = branding));
  mode: 'login' | 'register' = location.pathname.endsWith('/register') ? 'register' : 'login';
  fullName = '';
  email = '';
  phone = '';
  password = '';
  termsAccepted = false;
  termsModalOpen = false;
  termsConfirmed = false;
  showPassword = false;
  loading = false;
  error = '';
  returnUrl = '/portal';
  /** Email yang baru didaftarkan dan menunggu verifikasi. */
  pendingEmail = '';
  pendingMessage = '';
  /** Email yang ditolak login karena belum diverifikasi. */
  unverifiedEmail = '';
  info = '';
  resending = false;
  cooldown = 0;
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private auth: TalentAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    if (requested && requested.startsWith('/') && !requested.startsWith('//')) {
      this.returnUrl = requested;
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  login(): void {
    this.error = '';
    this.info = '';
    this.unverifiedEmail = '';
    this.loading = true;
    this.auth.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: (session) => {
        this.loading = false;
        if (session.onboardingCompleted === false) {
          this.router.navigate(['/onboarding'], { queryParams: { returnUrl: this.returnUrl } });
          return;
        }
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.loading = false;
        if (error?.status === 403 && error?.error?.code === 'EMAIL_NOT_VERIFIED') {
          this.unverifiedEmail = this.email.trim().toLowerCase();
          this.error = error.error.message || 'Email Anda belum diverifikasi.';
          return;
        }
        this.error = error?.error?.message || 'Email atau password tidak sesuai.';
      },
    });
  }

  requestRegister(): void {
    this.error = '';

    if (!this.fullName.trim() || !this.email.trim() || !this.phone.trim() || !this.password) {
      this.error = 'Nama lengkap, email, WhatsApp, dan password wajib diisi.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Password minimal 8 karakter.';
      return;
    }

    if (!this.termsAccepted) {
      this.error = 'Persetujuan penggunaan data wajib dicentang.';
      return;
    }

    this.termsConfirmed = false;
    this.termsModalOpen = true;
  }

  closeTermsModal(): void {
    if (this.loading) return;
    this.termsModalOpen = false;
    this.termsConfirmed = false;
  }

  closeTermsOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('terms-modal-backdrop')) {
      this.closeTermsModal();
    }
  }

  confirmTermsAndRegister(): void {
    if (!this.termsConfirmed || this.loading) return;

    this.error = '';
    this.loading = true;

    this.auth.register({
      fullName: this.fullName.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      password: this.password,
      termsAccepted: true,
    }).subscribe({
      next: (result) => {
        this.loading = false;
        this.termsModalOpen = false;
        if (result.verificationRequired) {
          this.info = '';
          this.pendingEmail = result.email;
          this.pendingMessage = result.message;
          this.password = '';
          this.error = result.emailSent ? '' : 'Email belum terkirim. Tekan tombol kirim ulang di bawah.';
          return;
        }
        const session = result.auth;
        if (!session || session.onboardingCompleted === false) {
          this.router.navigate(['/onboarding'], { queryParams: { returnUrl: this.returnUrl } });
          return;
        }
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.error = error?.error?.message || 'Akun belum berhasil dibuat. Periksa data Anda, lalu coba lagi.';
        this.loading = false;
        this.termsModalOpen = false;
        this.termsConfirmed = false;
      },
    });
  }

  resend(email: string): void {
    if (this.resending || this.cooldown > 0) return;
    this.error = '';
    this.info = '';
    this.resending = true;
    this.auth.resendVerification(email).subscribe({
      next: (response) => {
        this.resending = false;
        this.info = response.message;
        this.startCooldown(60);
      },
      error: (error) => {
        this.resending = false;
        this.error = error?.error?.message || 'Email verifikasi belum bisa dikirim. Coba lagi beberapa saat lagi.';
      },
    });
  }

  backToLogin(): void {
    this.email = this.pendingEmail;
    this.pendingEmail = '';
    this.mode = 'login';
    this.error = '';
    this.info = '';
  }

  private startCooldown(seconds: number): void {
    this.cooldown = seconds;
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.cooldown -= 1;
      if (this.cooldown <= 0 && this.cooldownTimer) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }
}
