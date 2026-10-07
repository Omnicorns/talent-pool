import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TalentProfileDetailsComponent } from '../../shared/talent-profile-details.component';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CandidateProfile, EducationItem, JobApplication, WorkExperienceItem } from '../../core/models/talent.models';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';

type DrawerSection = 'profile' | 'about' | 'experience' | 'education' | 'training' | 'additional';

@Component({
  selector: 'app-candidate-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CareerHeaderComponent, TalentProfileDetailsComponent],
  template: `
    <div class="portal-page" *ngIf="profile; else loadingTpl">
      <app-career-header active="portal" [profilePictureUrl]="profilePictureUrl"></app-career-header>

      <main class="profile-container">
        <div class="application-success-banner" *ngIf="applicationSubmitted">
          <div>
            <strong>✓ Lamaran berhasil dikirim</strong>
            <span>Status lamaran sekarang dapat dipantau di bagian “Lamaran Saya”.</span>
          </div>
          <button type="button" (click)="applicationSubmitted = false">×</button>
        </div>
        <section class="profile-hero-card">
          <div class="profile-main">
            <div class="profile-avatar">
              <img *ngIf="profilePictureUrl; else initialsTpl" [src]="profilePictureUrl" [alt]="profile.fullName">
              <ng-template #initialsTpl>{{ initials(profile.fullName) }}</ng-template>
            </div>
            <div class="profile-identity">
              <div class="profile-name-row"><h1>{{ profile.fullName }}</h1><span class="profile-open-status">Open to work</span></div>
              <p>{{ headline }}</p>
            </div>
            <div class="profile-actions">
              <button class="outline-button" (click)="downloadCv()" [disabled]="!profile.cvOriginalName || downloadingCv">⇩ {{ downloadingCv ? 'Mengunduh...' : 'Unduh CV' }}</button>
              <button class="primary-button" (click)="openDrawer('profile')">✎ Edit Profil</button>
            </div>
          </div>
          <div class="contact-grid">
            <span>✉ {{ profile.email }}</span>
            <span>☎ {{ profile.phone || '-' }}</span>
            <span>⌖ {{ profile.preferredLocations?.length ? profile.preferredLocations.join(', ') : 'Lokasi belum ditentukan' }}</span>
            <span>↗ {{ firstPortfolio || 'Portfolio belum ditambahkan' }}</span>
          </div>
        </section>

        <div class="profile-dashboard-grid">
          <div class="profile-main-column">
        <section class="profile-content-card">
          <nav class="profile-tabs">
            <button type="button" (click)="scrollToSection('about')">Tentang</button>
            <button type="button" (click)="scrollToSection('experiences')">Pengalaman</button>
            <button type="button" (click)="scrollToSection('education')">Pendidikan</button>
            <button type="button" (click)="scrollToSection('training')">Pelatihan & Sertifikasi</button>
            <button type="button" (click)="scrollToSection('additional')">Info Tambahan</button>
          </nav>

          <div class="profile-sections">
            <section id="about" class="profile-section">
              <div class="section-title"><h2>Tentang Saya</h2><button (click)="openDrawer('about')">✎</button></div>
              <p class="about-copy">{{ profile.about || 'Tambahkan ringkasan profesional Anda agar recruiter lebih mudah memahami profil Anda.' }}</p>
            </section>

            <section id="experiences" class="profile-section">
              <div class="section-title"><h2>Pengalaman Kerja</h2><button (click)="openDrawer('experience')">＋ Tambah</button></div>
              <ng-container *ngIf="profile.workExperiences?.length; else emptyExperience">
                <article class="timeline-item" *ngFor="let item of profile.workExperiences; let i = index">
                  <span class="timeline-dot"></span>
                  <div class="timeline-icon">▣</div>
                  <div>
                    <h3>{{ item.position }} <button class="icon-link" (click)="openDrawer('experience', i)">✎</button></h3>
                    <p>{{ item.companyName }}</p>
                    <small>{{ item.description || '-' }}</small>
                  </div>
                  <time>{{ item.startDate }} — {{ item.currentJob ? 'Sekarang' : (item.endDate || '-') }}</time>
                </article>
              </ng-container>
              <ng-template #emptyExperience><div class="empty-state">Belum ada pengalaman kerja.</div></ng-template>
            </section>

            <section id="education" class="profile-section">
              <div class="section-title"><h2>Pendidikan</h2><button (click)="openDrawer('education')">＋ Tambah</button></div>
              <ng-container *ngFor="let item of formalEducations">
                <article class="timeline-item">
                  <span class="timeline-dot"></span>
                  <div class="timeline-icon">⌂</div>
                  <div>
                    <h3>{{ item.institution }} <button class="icon-link" (click)="openEducationDrawer('education', item)">✎</button></h3>
                    <p>{{ item.level }} • {{ item.major }}</p>
                    <small>{{ item.description || '-' }}</small>
                  </div>
                  <time>{{ item.startYear || '-' }} — {{ item.endYear || 'Sekarang' }}</time>
                </article>
              </ng-container>
              <div class="empty-state" *ngIf="!formalEducations.length">Belum ada pendidikan formal.</div>
              <div class="education-supporting-documents" *ngIf="profile.supportingDocuments?.length">
                <h3>Dokumen Pendukung</h3>
                <button type="button" *ngFor="let doc of profile.supportingDocuments" (click)="downloadSupportingDocument(doc.key, doc.originalName)">{{ supportingDocumentLabel(doc.key) }}: {{ doc.originalName }} ↓</button>
              </div>
            </section>

            <section id="training" class="profile-section">
              <div class="section-title"><h2>Pelatihan & Sertifikasi</h2><button (click)="openDrawer('training')">＋ Tambah</button></div>
              <ng-container *ngFor="let item of profile.profileDetails?.trainingCertifications || []">
                <article class="timeline-item">
                  <span class="timeline-dot"></span>
                  <div class="timeline-icon">✓</div>
                  <div>
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.issuingOrganization }} • ID {{ item.credentialId }}</p>
                    <small>Terbit {{ item.issueDate | date:'dd MMM yyyy' }} · Kedaluwarsa {{ item.expiryDate | date:'dd MMM yyyy' }}</small>
                    <a *ngIf="item.credentialUrl" class="training-cert-link" [href]="item.credentialUrl" target="_blank" rel="noopener noreferrer">Lihat sertifikat ↗</a>
                  </div>
                </article>
              </ng-container>
              <ng-container *ngFor="let item of informalEducations">
                <article class="timeline-item">
                  <span class="timeline-dot"></span>
                  <div class="timeline-icon">✓</div>
                  <div>
                    <h3>{{ item.major || item.level }} <button class="icon-link" (click)="openEducationDrawer('training', item)">✎</button></h3>
                    <p>{{ item.institution }}</p>
                    <small>{{ item.description || '-' }}</small>
                  </div>
                  <time>{{ item.startYear || '-' }} — {{ item.endYear || '-' }}</time>
                </article>
              </ng-container>
              <div class="empty-state" *ngIf="!informalEducations.length && !profile.profileDetails?.trainingCertifications?.length">Belum ada training atau sertifikasi.</div>
            </section>

            <section id="additional" class="profile-section">
              <div class="section-title"><h2>Informasi Tambahan</h2><button (click)="openDrawer('additional')">✎</button></div>
              <div class="info-grid">
                <article><span>LinkedIn</span><strong>{{ profile.profileDetails?.linkedinUrl || '-' }}</strong></article>
                <article><span>Media Sosial</span><strong>{{ profile.profileDetails?.socialPlatform || '-' }} • {{ profile.profileDetails?.socialUsername || '-' }}</strong></article>
                <article><span>Ekspektasi Gaji per Bulan</span><strong>{{ profile.expectedSalary | currency:'IDR':'symbol':'1.0-0' }} – {{ profile.profileDetails?.expectedSalaryMax | currency:'IDR':'symbol':'1.0-0' }}</strong></article>
                <article><span>Fungsi yang Diminati</span><strong>{{ profile.jobInterests.join(', ') || '-' }}</strong></article>
                <article><span>Lokasi Kerja yang Diminati</span><strong>{{ profile.preferredLocations.join(', ') || '-' }}</strong></article>
                <article><span>Tools / Skills</span><strong>{{ profile.tools.join(', ') || '-' }}</strong></article>
              </div>
              <div class="additional-language-skills">
                <h3>Kemampuan Bahasa</h3>
                <p *ngIf="!profile.profileDetails?.languageSkills?.length">{{ profile.languanges || 'Belum ada kemampuan bahasa yang ditambahkan.' }}</p>
                <p *ngFor="let language of profile.profileDetails?.languageSkills">{{ language.name }} • {{ language.proficiency }}</p>
                <h3>Keahlian & Pengalaman</h3>
                <p *ngIf="profile.profileDetails?.noExperience">Belum memiliki pengalaman kerja.</p>
                <article class="talent-detail-work" *ngFor="let work of profile.workExperiences">
                  <ng-container *ngIf="work.details as data"><strong>{{ work.position }} • {{ work.companyName }}</strong><p>Skill: {{ data.skills.join(', ') || '-' }}</p><p>Tools: {{ data.tools.join(', ') || '-' }}</p></ng-container>
                </article>
              </div>
            </section>
          </div>
        </section>
          </div>

          <aside class="profile-sidebar">
            <section class="profile-completion-card">
              <div class="completion-card-heading"><h2>Kelengkapan Profil</h2><strong>{{ profileCompletion }}%</strong></div>
              <div class="completion-progress"><span [style.width.%]="profileCompletion"></span></div>
              <p>Profil lengkap lebih mudah ditemukan recruiter. Lengkapi bagian berikut:</p>
              <div class="completion-tip"><span>Pengalaman kerja</span><strong>+15%</strong></div>
              <div class="completion-tip"><span>Sertifikasi</span><strong>+10%</strong></div>
              <div class="completion-tip"><span>Keahlian & LinkedIn</span><strong>+10%</strong></div>
            </section>

            <section class="profile-personal-card">
              <div class="personal-card-heading"><h2>Data Personal</h2><button type="button" aria-label="Edit data personal" (click)="openDrawer('profile')">✎</button></div>
              <app-talent-profile-details [profile]="profile" [showPersonalHeading]="false" [showAdditionalInformation]="false" [showEducationInformation]="false"></app-talent-profile-details>
            </section>

        <section class="candidate-insight-grid candidate-insight-stack">
          <article class="candidate-insight-card">
            <div class="section-title"><h2>Recruiter Activity</h2></div>
            <div class="candidate-activity-list" *ngIf="activities.length; else noActivity">
              <div class="candidate-activity-item" *ngFor="let item of activities">
                <span class="candidate-activity-icon">{{ item.type === 'CV_VIEW' ? 'CV' : '👁' }}</span>
                <div>
                  <strong>{{ item.message }}</strong>
                  <small>{{ item.viewedAt | date:'dd MMM yyyy, HH:mm' }}</small>
                </div>
              </div>
            </div>
            <ng-template #noActivity>
              <div class="empty-state">Belum ada aktivitas recruiter pada profil Anda.</div>
            </ng-template>
          </article>

          <article class="candidate-insight-card">
            <div class="section-title"><h2>Jadwal Interview</h2></div>
            <div class="candidate-interview-list" *ngIf="interviews.length; else noInterview">
              <article class="candidate-interview-item" *ngFor="let item of interviews">
                <div>
                  <strong>{{ item.jobTitle || 'Talent Pool Interview' }}</strong>
                  <p>{{ item.scheduledAt | date:'dd MMM yyyy, HH:mm' }} • {{ item.durationMinutes }} menit</p>
                  <small>{{ item.mode }} • {{ item.locationOrLink || '-' }}</small>
                </div>
                <span class="candidate-status">{{ item.status }}</span>
              </article>
            </div>
            <ng-template #noInterview>
              <div class="empty-state">Belum ada jadwal interview.</div>
            </ng-template>
          </article>
        </section>
          </aside>
        </div>

        <section id="my-applications" class="applications-card">
          <div class="section-title"><h2>Lamaran Saya</h2><a routerLink="/open-positions">Lihat Lowongan</a></div>
          <article class="application-row application-progress-row" *ngFor="let app of applications">
            <div class="application-main-copy">
              <h3>{{ app.jobTitle }}</h3>
              <p>Applied {{ app.appliedAt | date:'dd MMM yyyy' }}</p>

              <div class="application-stage-progress" *ngIf="app.status !== 'REJECTED' && app.status !== 'WITHDRAWN'">
                <div
                  *ngFor="let stage of applicationStages; let i = index"
                  [class.active]="applicationStageIndex(app.stage) >= i"
                  [class.current]="applicationStageIndex(app.stage) === i">
                  <span>{{ applicationStageIndex(app.stage) > i ? '✓' : i + 1 }}</span>
                  <b>{{ stage.label }}</b>
                </div>
              </div>

              <div class="application-terminal-status" *ngIf="app.status === 'REJECTED' || app.status === 'WITHDRAWN'">
                {{ app.status === 'REJECTED' ? 'Lamaran tidak dilanjutkan' : 'Lamaran telah ditarik' }}
              </div>
            </div>

            <div class="application-row-actions">
              <button
                type="button"
                class="application-history-button"
                (click)="openApplicationHistory(app)">
                Lihat Riwayat
              </button>
              <button
                *ngIf="app.status === 'ACTIVE'"
                type="button"
                class="withdraw-button"
                (click)="withdrawApplication(app)">
                Tarik Lamaran
              </button>
            </div>
          </article>
          <div class="empty-state" *ngIf="!applications.length">Belum ada lamaran.</div>
        </section>
      </main>

      <div class="drawer-backdrop" *ngIf="applicationHistoryOpen" (click)="closeApplicationHistoryOnBackdrop($event)">
        <aside class="side-drawer application-history-drawer">
          <header>
            <div>
              <span class="bo-kicker">APPLICATION HISTORY</span>
              <h2>{{ selectedApplication?.jobTitle || 'Riwayat Lamaran' }}</h2>
              <p>Perjalanan proses rekrutmen untuk lowongan ini.</p>
            </div>
            <button (click)="closeApplicationHistory()">×</button>
          </header>

          <div class="drawer-body">
            <div class="application-history-loading" *ngIf="applicationHistoryLoading">Memuat riwayat...</div>

            <div class="application-history-timeline" *ngIf="!applicationHistoryLoading && applicationHistory.length">
              <article *ngFor="let item of applicationHistory; let i = index">
                <div class="application-history-marker">
                  <span>{{ i + 1 }}</span>
                  <i *ngIf="i < applicationHistory.length - 1"></i>
                </div>
                <div>
                  <strong>{{ historyTitle(item) }}</strong>
                  <p>{{ historyDescription(item) }}</p>
                  <small>{{ item.changedAt | date:'dd MMM yyyy, HH:mm' }}</small>
                </div>
              </article>
            </div>

            <div class="empty-state" *ngIf="!applicationHistoryLoading && !applicationHistory.length">
              Belum ada riwayat proses.
            </div>
          </div>
        </aside>
      </div>

      <div class="drawer-backdrop" *ngIf="drawerOpen" (click)="backdropClose($event)">
        <aside class="side-drawer">
          <header>
            <div>
              <h2>{{ drawerTitle }}</h2>
              <p>Perbarui data kandidat Anda.</p>
            </div>
            <button (click)="cancelDrawer()">×</button>
          </header>

          <div class="drawer-body">
            <div class="drawer-form" *ngIf="drawerSection === 'profile'">
              <div class="profile-photo-editor">
                <div class="profile-photo-preview">
                  <img *ngIf="profilePicturePreview || profilePictureUrl; else photoInitials" [src]="profilePicturePreview || profilePictureUrl" [alt]="profile.fullName">
                  <ng-template #photoInitials>{{ initials(profile.fullName) }}</ng-template>
                </div>
                <div>
                  <strong>Foto Profil</strong>
                  <p>JPG, JPEG, atau PNG. Foto akan tampil di dashboard Talent.</p>
                  <label class="photo-upload-button">
                    Pilih Foto
                    <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" (change)="onProfilePictureSelected($event)" hidden>
                  </label>
                  <small *ngIf="profilePictureFile">{{ profilePictureFile.name }}</small>
                </div>
              </div>
              <label>Nama Lengkap<input [(ngModel)]="profile.fullName"></label>
              <label>Email<input [ngModel]="profile.email" disabled></label>
              <label>WhatsApp<input [(ngModel)]="profile.phone"></label>
              <label>Agama<input [(ngModel)]="profile.religion"></label>
              <label>Preferred Locations<input [ngModel]="profile.preferredLocations.join(', ')" (ngModelChange)="profile.preferredLocations = splitList($event)"></label>
              <label>Related Positions<input [ngModel]="profile.relatedJobPositions.join(', ')" (ngModelChange)="profile.relatedJobPositions = splitList($event)"></label>
            </div>

            <div class="drawer-form" *ngIf="drawerSection === 'about'">
              <label>About<textarea rows="9" [(ngModel)]="profile.about" maxlength="4000"></textarea></label>
            </div>

            <div class="drawer-form" *ngIf="drawerSection === 'experience' && editExperience">
              <label>Posisi<input [(ngModel)]="editExperience.position"></label>
              <label>Perusahaan<input [(ngModel)]="editExperience.companyName"></label>
              <div class="drawer-grid"><label>Tanggal Mulai<input type="date" [(ngModel)]="editExperience.startDate"></label><label>Tanggal Selesai<input type="date" [(ngModel)]="editExperience.endDate" [disabled]="editExperience.currentJob"></label></div>
              <label class="check-row"><input type="checkbox" [(ngModel)]="editExperience.currentJob"> Saya masih bekerja di sini</label>
              <label>Deskripsi<textarea [(ngModel)]="editExperience.description"></textarea></label>
            </div>

            <div class="drawer-form" *ngIf="(drawerSection === 'education' || drawerSection === 'training') && editEducation">
              <label *ngIf="drawerSection === 'education'">Institusi<input [(ngModel)]="editEducation.institution"></label>
              <label *ngIf="drawerSection === 'education'">Jurusan<input [(ngModel)]="editEducation.major"></label>
              <label *ngIf="drawerSection === 'training'">Nama Training / Sertifikasi<input [(ngModel)]="editEducation.major"></label>
              <label *ngIf="drawerSection === 'training'">Penyelenggara<input [(ngModel)]="editEducation.institution"></label>
              <label>Level / Jenis<input [(ngModel)]="editEducation.level"></label>
              <div class="drawer-grid"><label>Tahun Mulai<input type="number" [(ngModel)]="editEducation.startYear"></label><label>Tahun Selesai<input type="number" [(ngModel)]="editEducation.endYear"></label></div>
              <label>Deskripsi<textarea [(ngModel)]="editEducation.description"></textarea></label>
            </div>

            <div class="drawer-form" *ngIf="drawerSection === 'additional'">
              <label>Languages<input [(ngModel)]="profile.languanges"></label>
              <label>LinkedIn<input [ngModel]="profile.profileDetails?.linkedinUrl || ''" (ngModelChange)="setLinkedInUrl($event)" type="url" placeholder="https://www.linkedin.com/in/..."></label>
              <label>Job Interests<input [ngModel]="profile.jobInterests.join(', ')" (ngModelChange)="profile.jobInterests = splitList($event)"></label>
              <label>Preferred Locations<input [ngModel]="profile.preferredLocations.join(', ')" (ngModelChange)="profile.preferredLocations = splitList($event)"></label>
              <label>Related Industries<input [ngModel]="profile.relatedIndustries.join(', ')" (ngModelChange)="profile.relatedIndustries = splitList($event)"></label>
              <label>Tools / Skills<input [ngModel]="profile.tools.join(', ')" (ngModelChange)="profile.tools = splitList($event)"></label>
              <label>Expected Salary<input type="number" [(ngModel)]="profile.expectedSalary"></label>
            </div>
          </div>

          <footer>
            <button class="cancel-button" (click)="cancelDrawer()" [disabled]="saving">Batal</button>
            <button class="primary-button" (click)="saveDrawer()" [disabled]="saving">{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</button>
          </footer>
        </aside>
      </div>
    </div>

    <ng-template #loadingTpl><div class="full-loading">Memuat profil kandidat...</div></ng-template>
  `,
})
export class CandidatePortalComponent implements OnInit {
  profile!: CandidateProfile;
  applications: JobApplication[] = [];
  activities: any[] = [];
  interviews: any[] = [];
  drawerOpen = false;
  drawerSection: DrawerSection | null = null;
  drawerIndex: number | null = null;
  snapshot: CandidateProfile | null = null;
  editExperience: WorkExperienceItem | null = null;
  editEducation: EducationItem | null = null;
  profilePictureFile: File | null = null;
  profilePictureUrl: string | null = null;
  profilePicturePreview: string | null = null;
  downloadingCv = false;
  saving = false;
  applicationSubmitted = false;
  applicationHistoryOpen = false;
  applicationHistoryLoading = false;
  applicationHistory: any[] = [];
  selectedApplication: JobApplication | null = null;
  applicationStages = [
    { value: 'NEW_CANDIDATE', label: 'Applied' },
    { value: 'SCREENING', label: 'Screening' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'OFFER', label: 'Offer' },
    { value: 'HIRED', label: 'Hired' },
  ];

  constructor(
    public auth: TalentAuthService,
    private portal: TalentPortalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.applicationSubmitted = !!this.route.snapshot.queryParamMap.get('applied');
  }

  ngOnInit(): void {
    this.reload();
    this.loadProfilePicture();

    if (this.applicationSubmitted) {
      setTimeout(() => {
        document.getElementById('my-applications')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 250);
    }
  }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  openApplicationHistory(app: JobApplication): void {
    this.selectedApplication = app;
    this.applicationHistory = [];
    this.applicationHistoryLoading = true;
    this.applicationHistoryOpen = true;

    this.portal.applicationHistory(app.id).subscribe({
      next: (items) => {
        this.applicationHistory = items || [];
        this.applicationHistoryLoading = false;
      },
      error: () => {
        this.applicationHistory = [];
        this.applicationHistoryLoading = false;
      },
    });
  }

  closeApplicationHistory(): void {
    this.applicationHistoryOpen = false;
    this.applicationHistoryLoading = false;
    this.applicationHistory = [];
    this.selectedApplication = null;
  }

  closeApplicationHistoryOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) {
      this.closeApplicationHistory();
    }
  }

  historyTitle(item: any): string {
    if (item.eventType === 'APPLIED') return 'Lamaran dikirim';
    if (item.eventType === 'WITHDRAWN') return 'Lamaran ditarik';
    if (item.stage === 'SCREENING') return 'Masuk tahap screening';
    if (item.stage === 'INTERVIEW') return 'Masuk tahap interview';
    if (item.stage === 'OFFER') return 'Masuk tahap offer';
    if (item.stage === 'HIRED') return 'Proses selesai';
    if (item.stage === 'REJECTED') return 'Proses dihentikan';
    return 'Status lamaran diperbarui';
  }

  historyDescription(item: any): string {
    if (item.eventType === 'APPLIED') return 'Lamaran Anda telah diterima oleh sistem.';
    if (item.eventType === 'WITHDRAWN') return 'Anda menarik lamaran ini.';
    if (item.stage === 'SCREENING') return 'Profil dan CV sedang ditinjau oleh tim rekrutmen.';
    if (item.stage === 'INTERVIEW') return 'Lamaran dilanjutkan ke proses interview.';
    if (item.stage === 'OFFER') return 'Lamaran telah masuk ke tahap penawaran.';
    if (item.stage === 'HIRED') return 'Proses rekrutmen untuk lowongan ini telah selesai.';
    if (item.stage === 'REJECTED') return 'Lamaran tidak dilanjutkan ke tahap berikutnya.';
    return item.notes || 'Tim rekrutmen memperbarui proses lamaran Anda.';
  }

  applicationStageIndex(stage: string | null | undefined): number {
    const index = this.applicationStages.findIndex((item) => item.value === stage);
    return index < 0 ? 0 : index;
  }

  withdrawApplication(app: JobApplication): void {
    if (!window.confirm(`Tarik lamaran untuk "${app.jobTitle}"?`)) return;

    this.portal.withdraw(app.id).subscribe({
      next: (updated: any) => {
        app.status = updated.status;
        app.stage = updated.stage;
      },
      error: (error) => {
        window.alert(error?.error?.message || 'Lamaran tidak dapat ditarik.');
      },
    });
  }

  supportingDocumentLabel(key: string): string {
    if (key.startsWith('language:')) {
      const language = this.profile.profileDetails?.languageSkills.find(item => key.includes(item.key));
      return `Sertifikat ${language?.name || 'Bahasa'}`;
    }
    const education = this.profile.educations.find(item => item.clientKey && key.includes(item.clientKey));
    return `${key.endsWith(':diploma') ? 'Ijazah' : 'Transkrip'} ${education?.institution || ''}`.trim();
  }

  downloadSupportingDocument(key: string, name: string): void {
    this.portal.supportingDocument(key).subscribe({
      next: blob => {
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      },
      error: () => window.alert('Dokumen gagal diunduh. Silakan coba lagi.'),
    });
  }

  loadProfilePicture(): void {
    this.portal.profilePicture().subscribe({
      next: (blob) => {
        if (this.profilePictureUrl) URL.revokeObjectURL(this.profilePictureUrl);
        this.profilePictureUrl = URL.createObjectURL(blob);
      },
      error: () => {
        this.profilePictureUrl = null;
      },
    });
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      input.value = '';
      return;
    }

    this.profilePictureFile = file;
    if (this.profilePicturePreview) URL.revokeObjectURL(this.profilePicturePreview);
    this.profilePicturePreview = URL.createObjectURL(file);
  }

  reload(): void {
    this.portal.profile().subscribe((profile) => this.profile = profile);
    this.portal.applications().subscribe((result) => this.applications = result?.content || []);
    this.portal.activities().subscribe((items) => this.activities = items || []);
    this.portal.interviews().subscribe((items) => this.interviews = items || []);
  }

  get formalEducations(): EducationItem[] { return (this.profile?.educations || []).filter((item) => item.type === 'FORMAL'); }
  get informalEducations(): EducationItem[] { return (this.profile?.educations || []).filter((item) => item.type === 'INFORMAL'); }
  get profileCompletion(): number {
    if (!this.profile) return 0;
    const checks = [
      !!this.profile.about?.trim(),
      !!this.profile.workExperiences?.length,
      !!this.formalEducations.length,
      !!this.profile.profileDetails?.trainingCertifications?.length,
      !!this.profile.profileDetails?.linkedinUrl?.trim(),
      !!this.profile.tools?.length || !!this.profile.profileDetails?.languageSkills?.length,
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }

  downloadCv(): void {
    if (!this.profile?.cvOriginalName || this.downloadingCv) return;
    this.downloadingCv = true;
    this.portal.cv().subscribe({
      next: blob => {
        this.downloadingCv = false;
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = this.profile.cvOriginalName || 'CV';
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      },
      error: () => {
        this.downloadingCv = false;
        window.alert('CV gagal diunduh. Silakan coba lagi.');
      },
    });
  }
  get firstPortfolio(): string { return this.profile?.portfolios?.find((item) => item.url)?.title || ''; }
  get headline(): string {
    const current = this.profile?.workExperiences?.find((item) => item.currentJob);
    if (current) return `${current.position} • ${current.companyName}`;
    return this.profile?.relatedJobPositions?.[0] || 'Talent Pool Candidate • PT Sarinah';
  }
  get drawerTitle(): string {
    const map: Record<DrawerSection, string> = {
      profile: 'Edit Profil',
      about: 'Edit About',
      experience: 'Work Experience',
      education: 'Education',
      training: 'Training & Certification',
      additional: 'Additional Information',
    };
    return this.drawerSection ? map[this.drawerSection] : '';
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  splitList(value: string): string[] {
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 3);
  }

  openDrawer(section: DrawerSection, index: number | null = null): void {
    this.snapshot = structuredClone(this.profile);
    this.drawerSection = section;
    this.drawerIndex = index;
    this.editExperience = null;
    this.editEducation = null;

    if (section === 'experience') {
      this.editExperience = index == null
        ? { companyName: '', position: '', startDate: '', endDate: null, currentJob: false, description: '', details: { employmentType: '', industry: '', skills: [], tools: [], resignReason: '' } }
        : structuredClone(this.profile.workExperiences[index]);
    }
    if (section === 'education' || section === 'training') {
      const type = section === 'education' ? 'FORMAL' : 'INFORMAL';
      this.editEducation = index == null
        ? { type, clientKey: type === 'FORMAL' ? crypto.randomUUID() : null, institution: '', level: '', major: '', startYear: null, endYear: null, description: '', ipk: null }
        : structuredClone(this.profile.educations[index]);
    }
    this.drawerOpen = true;
  }

  openEducationDrawer(section: 'education' | 'training', item: EducationItem): void {
    const index = this.profile.educations.indexOf(item);
    this.openDrawer(section, index >= 0 ? index : null);
  }

  setLinkedInUrl(value: string): void {
    this.profile.profileDetails ||= {
      gender: '', postalCode: '', region: '', linkedinUrl: '', socialPlatform: '', socialUsername: '',
      expectedSalaryMax: null, noExperience: false, languageSkills: [], trainingCertifications: [],
    };
    this.profile.profileDetails.linkedinUrl = value;
  }

  cancelDrawer(): void {
    if (this.snapshot) this.profile = this.snapshot;
    this.closeDrawer();
  }

  backdropClose(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) this.cancelDrawer();
  }

  saveDrawer(): void {
    if (this.drawerSection === 'experience' && this.editExperience) {
      if (this.drawerIndex == null) this.profile.workExperiences = [...this.profile.workExperiences, this.editExperience];
      else this.profile.workExperiences[this.drawerIndex] = this.editExperience;
    }

    if ((this.drawerSection === 'education' || this.drawerSection === 'training') && this.editEducation) {
      if (this.drawerIndex == null || this.drawerIndex < 0) this.profile.educations = [...this.profile.educations, this.editEducation];
      else this.profile.educations[this.drawerIndex] = this.editEducation;
    }

    this.saving = true;
    this.portal.saveProfile(this.profile, this.profilePictureFile).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.saving = false;
        const photoChanged = !!this.profilePictureFile;
        this.closeDrawer();
        if (photoChanged) this.loadProfilePicture();
      },
      error: () => this.saving = false,
    });
  }

  private closeDrawer(): void {
    this.drawerOpen = false;
    this.drawerSection = null;
    this.drawerIndex = null;
    this.snapshot = null;
    this.editExperience = null;
    this.editEducation = null;
    this.profilePictureFile = null;
    if (this.profilePicturePreview) URL.revokeObjectURL(this.profilePicturePreview);
    this.profilePicturePreview = null;
  }
}
