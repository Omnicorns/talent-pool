import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CandidateProfile, EducationItem, WorkExperienceItem } from '../../core/models/talent.models';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';

@Component({
  selector: 'app-talent-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="onboarding-page" *ngIf="profile; else loadingTpl">
      <div class="onboarding-top">
        <div>
          <h1>Gabung Talent Pool Sarinah</h1>
          <p>Lengkapi profil Anda melalui 7 langkah berikut.</p>
        </div>
        <a routerLink="/open-positions" class="onboarding-back">← Kembali ke Open Positions</a>
      </div>

      <div class="onboarding-progress"><span [style.width.%]="progress"></span></div>

      <section class="onboarding-card">
        <nav class="onboarding-steps">
          <button *ngFor="let item of steps; let i = index"
                  [class.active]="step === i + 1"
                  [class.done]="step > i + 1"
                  (click)="goToCompletedStep(i + 1)">
            <span>{{ step > i + 1 ? '✓' : i + 1 }}</span>
            <b>{{ item }}</b>
          </button>
        </nav>

        <div class="onboarding-body">
          <header class="onboarding-section-head">
            <span>{{ stepLabel }}</span>
            <div>
              <h2>{{ stepTitle }}</h2>
              <p>{{ stepDescription }}</p>
            </div>
          </header>

          <section *ngIf="step === 1" class="onboarding-form">
            <label class="upload-zone">
              <input type="file" accept=".pdf,.doc,.docx" (change)="selectCv($event)" hidden>
              <span class="upload-icon">⇧</span>
              <strong>{{ cvFile?.name || profile.cvOriginalName || 'Upload CV' }}</strong>
              <small>PDF, DOC, atau DOCX • Maks. 10 MB</small>
            </label>
            <p class="step-hint">CV diperlukan agar recruiter dapat meninjau profil Anda dengan lebih lengkap.</p>
          </section>

          <section *ngIf="step === 2" class="onboarding-form">
            <div class="form-grid two">
              <label>Nama Lengkap<input [(ngModel)]="profile.fullName"></label>
              <label>Email<input [ngModel]="profile.email" disabled></label>
              <label>WhatsApp<input [(ngModel)]="profile.phone"></label>
              <label>Tanggal Lahir<input type="date" [(ngModel)]="profile.birthDate"></label>
              <label>No. Identitas<input [(ngModel)]="profile.identityNumber"></label>
              <label>Agama<input [(ngModel)]="profile.religion"></label>
            </div>
            <label>Alamat KTP<textarea [(ngModel)]="profile.citizenIdAddress"></textarea></label>
            <label class="check-row"><input type="checkbox" [(ngModel)]="profile.sameAsCitizenIdAddress"> Alamat domisili sama dengan alamat KTP</label>
            <label *ngIf="!profile.sameAsCitizenIdAddress">Alamat Domisili<textarea [(ngModel)]="profile.residentialAddress"></textarea></label>
          </section>

          <section *ngIf="step === 3" class="onboarding-form">
            <article class="repeat-card" *ngFor="let edu of formalEducations; let i = index">
              <div class="repeat-card-head">
                <strong>Pendidikan {{ i + 1 }}</strong>
                <button *ngIf="formalEducations.length > 1" type="button" (click)="removeEducation(i)">Hapus</button>
              </div>
              <div class="form-grid two">
                <label>Jenjang<input [(ngModel)]="edu.level" placeholder="S1 / D3 / SMA"></label>
                <label>Institusi<input [(ngModel)]="edu.institution" placeholder="Nama universitas / sekolah"></label>
                <label>Jurusan<input [(ngModel)]="edu.major"></label>
                <label>IPK / Nilai<input [(ngModel)]="edu.ipk"></label>
                <label>Tahun Mulai<input type="number" [(ngModel)]="edu.startYear"></label>
                <label>Tahun Selesai<input type="number" [(ngModel)]="edu.endYear"></label>
              </div>
              <label>Deskripsi<textarea [(ngModel)]="edu.description"></textarea></label>
            </article>
            <button type="button" class="secondary-action" (click)="addEducation()">＋ Tambah Pendidikan</button>
          </section>

          <section *ngIf="step === 4" class="onboarding-form">
            <label class="check-row onboarding-check">
              <input type="checkbox" [(ngModel)]="noExperience" (ngModelChange)="toggleNoExperience()">
              Saya belum memiliki pengalaman kerja
            </label>

            <ng-container *ngIf="!noExperience">
              <article class="repeat-card" *ngFor="let exp of profile.workExperiences; let i = index">
                <div class="repeat-card-head">
                  <strong>Pengalaman {{ i + 1 }}</strong>
                  <button *ngIf="profile.workExperiences.length > 1" type="button" (click)="profile.workExperiences.splice(i,1)">Hapus</button>
                </div>
                <div class="form-grid two">
                  <label>Posisi<input [(ngModel)]="exp.position"></label>
                  <label>Perusahaan<input [(ngModel)]="exp.companyName"></label>
                  <label>Tanggal Mulai<input type="date" [(ngModel)]="exp.startDate"></label>
                  <label>Tanggal Selesai<input type="date" [(ngModel)]="exp.endDate" [disabled]="exp.currentJob"></label>
                </div>
                <label class="check-row"><input type="checkbox" [(ngModel)]="exp.currentJob"> Saya masih bekerja di sini</label>
                <label>Deskripsi<textarea [(ngModel)]="exp.description"></textarea></label>
              </article>
              <button type="button" class="secondary-action" (click)="addExperience()">＋ Tambah Pengalaman</button>
            </ng-container>
          </section>

          <section *ngIf="step === 5" class="onboarding-form">
            <div class="form-grid two">
              <label>Gaji Saat Ini<input type="number" min="0" [(ngModel)]="profile.currentSalary" placeholder="0"></label>
              <label>Ekspektasi Gaji<input type="number" min="0" [(ngModel)]="profile.expectedSalary" placeholder="0"></label>
            </div>
            <label>Posisi yang Diminati
              <input [ngModel]="profile.relatedJobPositions.join(', ')" (ngModelChange)="profile.relatedJobPositions = splitList($event)" placeholder="Backend Engineer, Software Engineer">
            </label>
            <label>Industri yang Diminati
              <input [ngModel]="profile.relatedIndustries.join(', ')" (ngModelChange)="profile.relatedIndustries = splitList($event)" placeholder="Retail, Technology">
            </label>
          </section>

          <section *ngIf="step === 6" class="onboarding-form">
            <div class="portfolio-upload-grid">
              <label class="upload-zone">
                <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" (change)="selectProfilePicture($event)" hidden>
                <span class="upload-icon">⇧</span>
                <strong>{{ profilePicture?.name || profile.profilePictureOriginalName || 'Upload foto profil' }}</strong>
                <small>JPG atau PNG • Maks. 10 MB</small>
              </label>
              <label class="upload-zone">
                <input type="file" multiple (change)="selectPortfolioFiles($event)" hidden>
                <span class="upload-icon">⇧</span>
                <strong>{{ portfolioFiles.length ? portfolioFiles.length + ' file dipilih' : 'Upload file portofolio' }}</strong>
                <small>Dapat memilih lebih dari satu file</small>
              </label>
            </div>

            <article class="portfolio-link-row" *ngFor="let item of portfolioLinks; let i = index">
              <label>Judul Link {{ i + 1 }}<input [(ngModel)]="item.title" placeholder="Portfolio"></label>
              <label>URL<input [(ngModel)]="item.url" placeholder="https://..."></label>
              <button type="button" *ngIf="portfolioLinks.length > 1" (click)="portfolioLinks.splice(i,1)">×</button>
            </article>
            <button type="button" class="secondary-action" (click)="portfolioLinks.push({ title: 'Portfolio', url: '' })">＋ Tambah Link</button>
          </section>

          <section *ngIf="step === 7" class="onboarding-form">
            <label>About<textarea rows="6" [(ngModel)]="profile.about" placeholder="Ceritakan pengalaman, keahlian, dan tujuan karier Anda..."></textarea></label>
            <div class="form-grid two">
              <label>Bahasa<input [(ngModel)]="profile.languanges" placeholder="Indonesia, English"></label>
              <label>Preferred Locations<input [ngModel]="profile.preferredLocations.join(', ')" (ngModelChange)="profile.preferredLocations = splitList($event)" placeholder="Jakarta, Bandung"></label>
              <label>Job Interests<input [ngModel]="profile.jobInterests.join(', ')" (ngModelChange)="profile.jobInterests = splitList($event)" placeholder="Technology, Retail"></label>
              <label>Tools / Skills<input [ngModel]="profile.tools.join(', ')" (ngModelChange)="profile.tools = splitList($event)" placeholder="Java, Spring Boot, PostgreSQL"></label>
            </div>
            <div class="onboarding-ready">
              <strong>Profil Anda siap disimpan.</strong>
              <p>Setelah menekan “Selesai & Masuk Talent Pool”, profil akan aktif di dashboard kandidat.</p>
            </div>
          </section>

          <p class="onboarding-error" *ngIf="error">{{ error }}</p>
        </div>

        <footer class="onboarding-footer">
          <span>ⓘ Pastikan semua data wajib telah diisi dengan benar.</span>
          <div>
            <button type="button" class="onboarding-prev" *ngIf="step > 1" (click)="previous()">‹ Sebelumnya</button>
            <button type="button" class="onboarding-next" *ngIf="step < 7" (click)="next()">Selanjutnya ›</button>
            <button type="button" class="onboarding-next" *ngIf="step === 7" [disabled]="saving" (click)="finish()">
              {{ saving ? 'Menyimpan...' : 'Selesai & Masuk Talent Pool' }} ›
            </button>
          </div>
        </footer>
      </section>
    </main>

    <ng-template #loadingTpl><div class="full-loading">Menyiapkan onboarding Talent Pool...</div></ng-template>
  `,
})
export class TalentOnboardingComponent implements OnInit {
  profile!: CandidateProfile;
  step = 1;
  cvFile: File | null = null;
  profilePicture: File | null = null;
  portfolioFiles: File[] = [];
  portfolioLinks: Array<{ title: string; url: string }> = [{ title: 'Portfolio', url: '' }];
  noExperience = false;
  saving = false;
  error = '';
  returnUrl = '/portal';

  steps = ['Upload CV','Informasi Pribadi','Pendidikan','Pengalaman Kerja','Kompensasi','Portofolio','Additional Info'];

  constructor(
    private portal: TalentPortalService,
    private auth: TalentAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    if (requested && requested.startsWith('/') && !requested.startsWith('//')) {
      this.returnUrl = requested;
    }
  }

  ngOnInit(): void {
    if (this.auth.session?.onboardingCompleted !== false) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    this.portal.profile().subscribe({
      next: (profile) => {
        this.profile = {
          ...profile,
          relatedIndustries: profile.relatedIndustries || [],
          relatedJobPositions: profile.relatedJobPositions || [],
          tools: profile.tools || [],
          jobInterests: profile.jobInterests || [],
          preferredLocations: profile.preferredLocations || [],
          educations: profile.educations || [],
          workExperiences: profile.workExperiences || [],
          portfolios: profile.portfolios || [],
        };

        if (!this.formalEducations.length) this.addEducation();
        if (!this.profile.workExperiences.length) this.addExperience();

        const links = this.profile.portfolios
          .filter((item) => item.type === 'LINK' && item.url)
          .map((item) => ({ title: item.title || 'Portfolio', url: item.url || '' }));
        if (links.length) this.portfolioLinks = links;
      },
      error: () => this.error = 'Profil kandidat gagal dimuat.',
    });
  }

  get progress(): number { return (this.step / 7) * 100; }
  get stepLabel(): string { return String(this.step).padStart(2, '0'); }
  get formalEducations(): EducationItem[] { return this.profile?.educations?.filter((item) => item.type === 'FORMAL') || []; }

  get stepTitle(): string {
    return ['Upload CV','Informasi Pribadi','Pendidikan','Pengalaman Kerja','Kompensasi & Minat','Profil & Portofolio','Additional Information'][this.step - 1];
  }

  get stepDescription(): string {
    return [
      'Upload CV terbaru Anda untuk membantu proses screening.',
      'Lengkapi informasi dasar dan kontak yang dapat dihubungi.',
      'Tambahkan riwayat pendidikan formal Anda.',
      'Ceritakan pengalaman kerja yang relevan.',
      'Isi ekspektasi kompensasi dan minat karier.',
      'Tambahkan foto profil, dokumen pendukung, dan tautan portofolio.',
      'Lengkapi ringkasan profil, bahasa, lokasi, dan keahlian.'
    ][this.step - 1];
  }

  addEducation(): void {
    this.profile.educations.push({
      type: 'FORMAL',
      level: '',
      institution: '',
      major: '',
      startYear: null,
      endYear: null,
      description: '',
      ipk: null,
    });
  }

  removeEducation(formalIndex: number): void {
    const target = this.formalEducations[formalIndex];
    const index = this.profile.educations.indexOf(target);
    if (index >= 0) this.profile.educations.splice(index, 1);
  }

  addExperience(): void {
    this.profile.workExperiences.push({
      companyName: '',
      position: '',
      startDate: '',
      endDate: '',
      currentJob: false,
      description: '',
    });
  }

  toggleNoExperience(): void {
    if (this.noExperience) this.profile.workExperiences = [];
    else if (!this.profile.workExperiences.length) this.addExperience();
  }

  selectCv(event: Event): void {
    this.cvFile = (event.target as HTMLInputElement).files?.[0] || null;
  }

  selectProfilePicture(event: Event): void {
    this.profilePicture = (event.target as HTMLInputElement).files?.[0] || null;
  }

  selectPortfolioFiles(event: Event): void {
    this.portfolioFiles = Array.from((event.target as HTMLInputElement).files || []);
  }

  splitList(value: string): string[] {
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 3);
  }

  goToCompletedStep(target: number): void {
    if (target < this.step) this.step = target;
  }

  previous(): void {
    this.error = '';
    this.step = Math.max(1, this.step - 1);
  }

  next(): void {
    this.error = '';
    if (!this.validateCurrentStep()) return;
    this.step = Math.min(7, this.step + 1);
  }

  private validateCurrentStep(): boolean {
    if (this.step === 1 && !this.cvFile && !this.profile.cvOriginalName) {
      this.error = 'Upload CV terlebih dahulu.';
      return false;
    }
    if (this.step === 2 && (!this.profile.fullName?.trim() || !this.profile.phone?.trim())) {
      this.error = 'Nama lengkap dan WhatsApp wajib diisi.';
      return false;
    }
    if (this.step === 3) {
      const invalid = this.formalEducations.some((item) => !item.institution?.trim() || !item.level?.trim());
      if (invalid) {
        this.error = 'Jenjang dan institusi pendidikan wajib diisi.';
        return false;
      }
    }
    if (this.step === 4 && !this.noExperience) {
      const invalid = this.profile.workExperiences.some((item) => !item.companyName?.trim() || !item.position?.trim() || !item.startDate);
      if (invalid) {
        this.error = 'Posisi, perusahaan, dan tanggal mulai pengalaman kerja wajib diisi.';
        return false;
      }
    }
    return true;
  }

  finish(): void {
    this.error = '';
    if (!this.validateCurrentStep()) return;

    this.profile.portfolios = [
      ...(this.profile.portfolios || []).filter((item) => item.type !== 'LINK'),
      ...this.portfolioLinks
        .filter((item) => item.title.trim() && item.url.trim())
        .map((item) => ({ type: 'LINK', title: item.title.trim(), url: item.url.trim() })),
    ];

    this.saving = true;
    this.portal.saveProfile(this.profile, this.profilePicture, this.cvFile, this.portfolioFiles).subscribe({
      next: () => {
        this.auth.completeOnboarding().subscribe({
          next: () => this.router.navigateByUrl(this.returnUrl),
          error: (error) => {
            this.saving = false;
            this.error = error?.error?.message || 'Status onboarding gagal diperbarui.';
          },
        });
      },
      error: (error) => {
        this.saving = false;
        this.error = error?.error?.message || 'Profil onboarding gagal disimpan.';
      },
    });
  }
}
