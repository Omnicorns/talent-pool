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
        <img src="images/sarinah.png" class="auth-brand" alt="Sarinah">
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
            <label>Password
              <div class="password-field">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" minlength="8" required>
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
            <div class="auth-helper-row">
              <span></span>
              <a routerLink="/forgot-password">Lupa Password?</a>
            </div>
            <button class="primary-button" [disabled]="loading">{{ loading ? 'Memproses...' : 'Sign In →' }}</button>
          </form>
        </div>

        <div *ngIf="mode === 'register'">
          <h2>Create Candidate Account</h2>
          <p class="muted">Buat akun untuk mengelola profil dan lamaran Anda.</p>
          <form (ngSubmit)="requestRegister()">
            <label>Nama Lengkap<input [(ngModel)]="fullName" name="fullName" required></label>
            <div class="two-col">
              <label>Email<input type="email" [(ngModel)]="email" name="registerEmail" required></label>
              <label>WhatsApp<input [(ngModel)]="phone" name="phone" required></label>
            </div>
            <label>Password
              <div class="password-field">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="registerPassword" minlength="8" required>
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
            <label class="checkbox"><input type="checkbox" [(ngModel)]="termsAccepted" name="termsAccepted"> Saya menyetujui penggunaan data untuk proses rekrutmen.</label>
            <button class="primary-button" [disabled]="loading">{{ loading ? 'Memproses...' : 'Create Account →' }}</button>
          </form>
        </div>

        <p class="form-error" *ngIf="error">{{ error }}</p>
      </section>

      <div class="terms-modal-backdrop" *ngIf="termsModalOpen" (click)="closeTermsOnBackdrop($event)">
        <section class="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
          <header class="terms-modal-header">
            <div>
              <span class="bo-kicker">PERLINDUNGAN DATA PRIBADI</span>
              <h2 id="terms-title">Syarat dan Ketentuan Penggunaan Data untuk Kebutuhan Rekrutmen</h2>
            </div>
            <button type="button" class="terms-modal-close" (click)="closeTermsModal()" aria-label="Tutup">×</button>
          </header>

          <div class="terms-modal-body">
            <p>
              Dengan menyetujui syarat dan ketentuan ini, Anda memberikan izin kepada
              <strong>PT Aviasi Pariwisata Indonesia (Persero)</strong> untuk memproses data pribadi Anda
              yang telah dikirimkan sehubungan dengan proses rekrutmen. Berikut adalah ketentuan penggunaannya:
            </p>

            <section>
              <h3>1. Data yang Dikumpulkan</h3>
              <p>Kami dapat mengumpulkan dan memproses informasi pribadi Anda, termasuk namun tidak terbatas pada:</p>
              <ul>
                <li>Nama lengkap.</li>
                <li>Informasi kontak seperti alamat email, nomor telepon, dan alamat rumah.</li>
                <li>Data profesional seperti riwayat pendidikan, pengalaman kerja, sertifikasi, dan keahlian.</li>
                <li>Dokumen yang relevan seperti CV, portofolio, dan surat lamaran.</li>
              </ul>
            </section>

            <section>
              <h3>2. Tujuan Penggunaan Data</h3>
              <p>Data Anda akan digunakan untuk:</p>
              <ul>
                <li>Menilai kecocokan Anda dengan posisi pekerjaan yang dilamar.</li>
                <li>Menghubungi Anda selama proses rekrutmen.</li>
                <li>Menyimpan informasi untuk pertimbangan pada lowongan pekerjaan lain yang relevan, jika diizinkan.</li>
              </ul>
            </section>

            <section>
              <h3>3. Penyimpanan Data</h3>
              <p>
                Data Anda akan disimpan selama 2 tahun setelah akhir proses rekrutmen, kecuali jika Anda meminta
                penghapusan lebih awal. Data akan dihapus atau dianonimkan jika tidak lagi diperlukan.
              </p>
            </section>

            <section>
              <h3>4. Pembagian Data</h3>
              <p>Data Anda dapat dibagikan dengan pihak yang terkait dengan proses rekrutmen, termasuk:</p>
              <ul>
                <li>Tim rekrutmen internal atau konsultan rekrutmen pihak ketiga.</li>
              </ul>
              <p>
                Kami tidak akan menjual atau memberikan data Anda kepada pihak lain untuk tujuan pemasaran tanpa
                persetujuan Anda.
              </p>
            </section>

            <section>
              <h3>5. Hak Anda</h3>
              <p>Anda memiliki hak sebagai berikut:</p>
              <ul>
                <li><strong>Hak Akses:</strong> meminta salinan data pribadi yang kami simpan.</li>
                <li><strong>Hak Koreksi:</strong> memperbaiki data pribadi yang tidak akurat.</li>
                <li><strong>Hak Penghapusan:</strong> meminta penghapusan data pribadi Anda dalam batas hukum yang berlaku.</li>
                <li><strong>Hak Keberatan:</strong> menarik persetujuan kapan saja tanpa memengaruhi sahnya pemrosesan sebelum penarikan.</li>
              </ul>
              <p>Permintaan terkait hak Anda dapat diajukan melalui email atau nomor kontak perusahaan.</p>
            </section>

            <section>
              <h3>6. Keamanan Data</h3>
              <p>
                Kami berkomitmen untuk melindungi data pribadi Anda dengan menerapkan langkah-langkah keamanan fisik,
                teknis, dan administratif sesuai standar industri.
              </p>
            </section>

            <section>
              <h3>7. Persetujuan</h3>
              <p>Dengan mengirimkan aplikasi Anda, Anda menyatakan bahwa:</p>
              <ul>
                <li>Data yang diberikan adalah benar dan akurat.</li>
                <li>Anda memberikan persetujuan kepada Perusahaan untuk memproses data pribadi Anda sebagaimana diuraikan dalam syarat dan ketentuan ini.</li>
              </ul>
            </section>

            <section>
              <h3>8. Perubahan Kebijakan</h3>
              <p>
                Kami dapat memperbarui kebijakan ini sewaktu-waktu. Anda akan diberitahu melalui email atau
                pengumuman di situs web kami mengenai perubahan tersebut.
              </p>
              <p>
                PT Aviasi Pariwisata Indonesia (Persero) berkomitmen mematuhi ketentuan
                <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi</strong>.
              </p>
            </section>
          </div>

          <footer class="terms-modal-footer">
            <label class="terms-confirm-check">
              <input type="checkbox" [(ngModel)]="termsConfirmed" name="termsConfirmed">
              <span>Saya telah membaca dan menyetujui syarat dan ketentuan ini.</span>
            </label>

            <div class="terms-modal-actions">
              <button type="button" class="cancel-button" (click)="closeTermsModal()" [disabled]="loading">Batal</button>
              <button
                type="button"
                class="primary-button"
                (click)="confirmTermsAndRegister()"
                [disabled]="!termsConfirmed || loading">
                {{ loading ? 'Memproses...' : 'Konfirmasi' }}
              </button>
            </div>
          </footer>
        </section>
      </div>

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
  termsModalOpen = false;
  termsConfirmed = false;
  showPassword = false;
  loading = false;
  error = '';

  constructor(private auth: TalentAuthService, private router: Router) {}

  login(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: (session) => this.router.navigateByUrl(session.onboardingCompleted ? '/portal' : '/onboarding'),
      error: (error) => {
        this.error = error?.error?.message || 'Sign in gagal.';
        this.loading = false;
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
      next: (session) => {
        this.loading = false;
        this.termsModalOpen = false;
        this.router.navigateByUrl(session.onboardingCompleted ? '/portal' : '/onboarding');
      },
      error: (error) => {
        this.error = error?.error?.message || 'Pembuatan akun gagal.';
        this.loading = false;
        this.termsModalOpen = false;
        this.termsConfirmed = false;
      },
    });
  }
}
