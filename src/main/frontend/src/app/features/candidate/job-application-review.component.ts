import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CandidateProfile, JobApplication, JobListing } from '../../core/models/talent.models';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-job-application-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CareerHeaderComponent, IconComponent],
  template: `
    <div class="site">
      <app-career-header active="portal"></app-career-header>

      <main class="apply-page" *ngIf="job && profile; else loadingTpl">
        <div class="container">
          <a [routerLink]="['/jobs', job.id]" class="back-link"><app-icon name="arrow-left" [size]="16"></app-icon> Kembali ke detail lowongan</a>

          <div class="apply-steps" aria-label="Tahapan melamar">
            <span>Lowongan</span><i class="sep"></i><b class="now">Periksa lamaran</b><i class="sep"></i><span>Terkirim</span>
          </div>

          <div class="apply-layout">
            <section class="apply-card">
              <div>
                <h1>Periksa lamaran Anda</h1>
                <p>Lamaran dikirim menggunakan profil dan CV di akun Anda.</p>
              </div>

              <div class="apply-who">
                <div>
                  <strong>{{ profile.fullName }}</strong>
                  <small>{{ profile.email }} · {{ profile.phone || 'nomor WhatsApp belum diisi' }}</small>
                </div>
                <a class="btn btn-secondary btn-sm" routerLink="/portal">Ubah profil</a>
              </div>

              <div class="checklist">
                <div [class.ok]="!!profile.cvOriginalName">
                  <app-icon [name]="profile.cvOriginalName ? 'check' : 'alert'"></app-icon>
                  <div><strong>CV</strong><small>{{ profile.cvOriginalName || 'Belum ada CV. Unggah CV di profil sebelum melamar.' }}</small></div>
                </div>
                <div [class.ok]="!!profile.phone">
                  <app-icon [name]="profile.phone ? 'check' : 'alert'"></app-icon>
                  <div><strong>Nomor WhatsApp</strong><small>{{ profile.phone || 'Tambahkan nomor WhatsApp di profil agar recruiter bisa menghubungi Anda.' }}</small></div>
                </div>
                <div [class.ok]="profile.workExperiences.length > 0 || profile.educations.length > 0">
                  <app-icon [name]="(profile.workExperiences.length || profile.educations.length) ? 'check' : 'alert'"></app-icon>
                  <div><strong>Riwayat karier</strong><small>{{ profile.workExperiences.length }} pengalaman kerja · {{ profile.educations.length }} pendidikan</small></div>
                </div>
              </div>

              <label class="field">Catatan untuk recruiter <span class="opt">(opsional)</span>
                <textarea [(ngModel)]="notes" maxlength="2000" rows="4" placeholder="Misalnya ketersediaan mulai kerja atau hal lain yang relevan dengan posisi ini"></textarea>
              </label>

              <label class="check">
                <input type="checkbox" [(ngModel)]="confirmed">
                <span>Data profil dan CV yang saya gunakan untuk lamaran ini sudah benar.</span>
              </label>

              <div class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>

              <button class="btn btn-primary btn-lg" [disabled]="submitting || !confirmed || !canApply" (click)="submit()">
                {{ submitting ? 'Mengirim lamaran…' : 'Kirim lamaran' }}
              </button>
            </section>

            <aside class="job-aside" aria-label="Ringkasan lowongan">
              <p class="muted" style="font-size: 14px">{{ job.department || 'Sarinah' }}</p>
              <h2 style="font-size: 18px; margin-bottom: 8px">{{ job.title }}</h2>
              <dl class="facts one">
                <div><dt>Lokasi</dt><dd>{{ job.location || '-' }}</dd></div>
                <div><dt>Tipe pekerjaan</dt><dd>{{ fmt.label(job.employmentType) }}</dd></div>
                <div><dt>Batas lamaran</dt><dd>{{ job.applicationDeadline ? fmt.fullDate(job.applicationDeadline) : 'Tanpa batas' }}</dd></div>
              </dl>
              <p class="muted" style="font-size: 13.5px; margin-top: 14px">Setelah terkirim, status lamaran bisa dipantau di Profil saya.</p>
            </aside>
          </div>
        </div>
      </main>

      <ng-template #loadingTpl>
        <div class="full-loading">{{ error || 'Menyiapkan lamaran…' }}</div>
      </ng-template>
    </div>
  `,
})
export class JobApplicationReviewComponent implements OnInit {
  readonly fmt = FMT;
  job: JobListing | null = null;
  profile: CandidateProfile | null = null;
  existing: JobApplication | null = null;
  notes = '';
  confirmed = false;
  submitting = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portal: TalentPortalService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Lowongan tidak ditemukan.';
      return;
    }

    this.portal.job(id).subscribe({
      next: (job) => this.job = job,
      error: (error) => this.error = error?.error?.message || 'Lowongan tidak tersedia.',
    });

    this.portal.profile().subscribe({
      next: (profile) => this.profile = profile,
      error: () => this.error = 'Profil kandidat gagal dimuat.',
    });

    this.portal.applications().subscribe({
      next: (result) => {
        this.existing = (result.content || []).find((item) => item.jobListingId === id) || null;
        if (this.existing) {
          this.error = 'Anda sudah melamar lowongan ini. Pantau statusnya di Profil saya.';
        }
      },
    });
  }

  get canApply(): boolean {
    return !!this.profile?.cvOriginalName
      && !!this.profile?.phone
      && !this.existing;
  }

  submit(): void {
    if (!this.job || !this.canApply || !this.confirmed || this.submitting) return;

    this.submitting = true;
    this.error = '';

    this.portal.apply(this.job.id, this.notes).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/portal'], { queryParams: { applied: this.job?.id } });
      },
      error: (error) => {
        this.submitting = false;
        this.error = error?.error?.message || 'Lamaran belum terkirim. Periksa koneksi Anda, lalu coba lagi.';
      },
    });
  }
}
