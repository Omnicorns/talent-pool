import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';
import { PublicJobService } from '../../core/service/api/public-job.service';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { JobListing } from '../../core/models/talent.models';
import { IconComponent } from '../../shared/icon.component';
import { FMT } from '../../shared/labels';

@Component({
    selector: 'app-open-positions',
    imports: [RouterLink, IconComponent],
    template: `
    <div class="section-head split">
      <div>
        <span class="eyebrow-red">Karier</span>
        <h2 id="positions-title">Open Positions</h2>
        <p>Temukan posisi yang sesuai dengan pengalaman dan minat Anda.</p>
      </div>
      @if (!loading && !error && jobs.length) {
        <span class="count-pill">{{ jobs.length }} posisi dibuka</span>
      }
    </div>
    
    @if (loading) {
      <p class="muted" role="status">Memuat lowongan…</p>
    }
    
    @if (error) {
      <div class="alert alert-error" role="alert">
        <app-icon name="alert"></app-icon>
        <div><strong>Lowongan belum bisa dimuat</strong><p>{{ error }}</p></div>
        <button type="button" class="btn btn-secondary btn-sm alert-dismiss" (click)="loadJobs()">Coba lagi</button>
      </div>
    }
    
    @if (!loading && !error) {
      @if (jobs.length) {
        <div class="pos-grid">
          @for (job of jobs; track job) {
            <a class="pos-card" [routerLink]="['/jobs', job.id]">
              <div class="pos-top">
                <span class="pos-dept">{{ job.department || 'Sarinah' }}</span>
                <h3>{{ job.title }}</h3>
              </div>
              <div class="pos-tags">
                <span><app-icon name="pin" [size]="15"></app-icon>{{ job.location || 'Jakarta' }}</span>
                @if (job.employmentType) {
                  <span><app-icon name="briefcase" [size]="15"></app-icon>{{ fmt.label(job.employmentType) }}</span>
                }
              </div>
              <div class="pos-foot">
                <span><app-icon name="calendar" [size]="15"></app-icon>{{ job.applicationDeadline ? 'Hingga ' + fmt.fullDate(job.applicationDeadline) : 'Tanpa batas lamaran' }}</span>
                <span class="pos-go">Lihat detail <app-icon name="arrow-up-right" [size]="15"></app-icon></span>
              </div>
            </a>
          }
        </div>
      } @else {
        <div class="empty empty-jobs"><span class="empty-icon"><app-icon name="briefcase" [size]="24"></app-icon></span><strong>Belum ada lowongan yang dibuka</strong>Gabung ke Talent Pool agar kami bisa menghubungi Anda saat ada posisi yang sesuai.</div>
      }
    }
    
    <aside class="invite" aria-label="Gabung Talent Pool">
      <div>
        <h3>Belum menemukan posisi yang sesuai?</h3>
        <p>Simpan profil Anda di Talent Pool agar tim rekrutmen dapat mempertimbangkan Anda untuk peluang berikutnya.</p>
      </div>
      <a class="btn btn-primary" [routerLink]="talentPoolLink">{{ talentPoolLabel }}</a>
    </aside>
    `
})
export class OpenPositionsComponent implements OnInit {
  readonly fmt = FMT;
  jobs: JobListing[] = [];
  loading = true;
  error = '';

  constructor(private jobsApi: PublicJobService, public auth: TalentAuthService) {}

  get talentPoolLink(): string {
    if (!this.auth.authenticated) return '/register';
    return this.auth.session?.onboardingCompleted === false ? '/onboarding' : '/portal';
  }

  get talentPoolLabel(): string {
    if (!this.auth.authenticated) return 'Gabung Talent Pool';
    return this.auth.session?.onboardingCompleted === false ? 'Lengkapi profil' : 'Lihat profil saya';
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.error = '';
    this.jobsApi.list().subscribe({
      next: (result: any) => {
        this.jobs = Array.isArray(result) ? result : (result?.content || []);
        this.loading = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'Periksa koneksi internet Anda, lalu coba lagi.';
        this.loading = false;
      },
    });
  }
}
