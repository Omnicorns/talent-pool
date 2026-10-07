import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TalentProfileDetailsComponent } from '../../shared/talent-profile-details.component';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CandidateProfile, EducationItem, JobApplication, WorkExperienceItem } from '../../core/models/talent.models';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';

type DrawerSection = 'profile' | 'about' | 'experience' | 'education' | 'training' | 'additional';

@Component({
  selector: 'app-candidate-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CareerHeaderComponent, TalentProfileDetailsComponent, IconComponent],
  template: `
    <div class="site" *ngIf="profile; else loadingTpl">
      <app-career-header active="portal" [profilePictureUrl]="profilePictureUrl"></app-career-header>

      <main class="portal">
        <div class="container">
          <div class="alert alert-success" *ngIf="applicationSubmitted" role="status" style="margin-bottom: 20px">
            <app-icon name="check"></app-icon>
            <div><strong>Lamaran terkirim</strong><p>Pantau perkembangannya di bagian Lamaran saya di bawah.</p></div>
            <button type="button" class="icon-btn alert-dismiss" (click)="applicationSubmitted = false" aria-label="Tutup pesan"><app-icon name="x" [size]="16"></app-icon></button>
          </div>

          <section class="profile-head">
            <span class="avatar avatar-lg">
              <img *ngIf="profilePictureUrl; else initialsTpl" [src]="profilePictureUrl" [alt]="'Foto ' + profile.fullName">
              <ng-template #initialsTpl>{{ fmt.initials(profile.fullName) }}</ng-template>
            </span>
            <div>
              <h1>{{ profile.fullName }}</h1>
              <p class="headline">{{ headline }}</p>
              <div class="contact-list">
                <span><app-icon name="mail" [size]="16"></app-icon>{{ profile.email }}</span>
                <span><app-icon name="phone" [size]="16"></app-icon>{{ profile.phone || 'Nomor belum diisi' }}</span>
                <span><app-icon name="pin" [size]="16"></app-icon>{{ profile.preferredLocations.length ? profile.preferredLocations.join(', ') : 'Lokasi belum dipilih' }}</span>
                <span *ngIf="firstPortfolio"><app-icon name="link" [size]="16"></app-icon>{{ firstPortfolio }}</span>
              </div>
            </div>
            <div class="profile-head-actions">
              <button class="btn btn-secondary" (click)="openDrawer('profile')"><app-icon name="edit" [size]="16"></app-icon> Ubah profil</button>
            </div>
          </section>

          <div class="profile-layout">
            <div class="profile-main">
              <section id="my-applications" class="profile-card profile-section">
                <div class="section-title"><h2>Lamaran saya</h2><a class="btn btn-secondary btn-sm" routerLink="/" fragment="open-positions">Cari lowongan</a></div>
                <div class="app-list" *ngIf="applications.length; else noApplications">
                  <article class="app" *ngFor="let app of applications">
                    <div>
                      <h3>{{ app.jobTitle }}</h3>
                      <p class="when">Dilamar {{ fmt.fullDate(app.appliedAt) }}</p>
                    </div>
                    <div class="app-actions">
                      <button type="button" class="btn btn-ghost btn-sm" (click)="openApplicationHistory(app)"><app-icon name="history" [size]="16"></app-icon> Riwayat</button>
                      <button *ngIf="app.status === 'ACTIVE'" type="button" class="btn btn-danger btn-sm" (click)="withdrawApplication(app)">Tarik lamaran</button>
                    </div>
                    <div class="stage-track" *ngIf="app.status !== 'REJECTED' && app.status !== 'WITHDRAWN'; else ended" [attr.aria-label]="'Tahap saat ini: ' + applicationStages[applicationStageIndex(app.stage)].label">
                      <div *ngFor="let stage of applicationStages; let i = index"
                        [class.done]="applicationStageIndex(app.stage) > i || app.status === 'HIRED'"
                        [class.current]="applicationStageIndex(app.stage) === i && app.status !== 'HIRED'">
                        <i></i><span>{{ stage.label }}</span>
                      </div>
                    </div>
                    <ng-template #ended>
                      <p class="app-ended"><app-icon name="info" [size]="16"></app-icon>{{ app.status === 'REJECTED' ? 'Lamaran tidak dilanjutkan ke tahap berikutnya.' : 'Anda telah menarik lamaran ini.' }}</p>
                    </ng-template>
                  </article>
                </div>
                <ng-template #noApplications>
                  <div class="empty"><strong>Belum ada lamaran</strong>Lihat lowongan yang sedang dibuka dan lamar dengan profil ini.</div>
                </ng-template>
              </section>
              <section class="profile-card">
                <nav class="profile-tabs" aria-label="Bagian profil">
                  <button type="button" *ngFor="let tab of tabs" [class.active]="activeSection === tab.id"
                    [attr.aria-current]="activeSection === tab.id ? 'true' : null" (click)="scrollToSection(tab.id)">{{ tab.label }}</button>
                </nav>

                <section id="about" class="profile-section">
                  <div class="section-title"><h2>Tentang saya</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('about')"><app-icon name="edit" [size]="16"></app-icon> Ubah</button></div>
                  <p class="about-copy" [class.placeholder]="!profile.about">{{ profile.about || 'Tulis ringkasan singkat tentang pengalaman dan tujuan karier Anda agar recruiter cepat memahami profil Anda.' }}</p>
                </section>

                <section id="experiences" class="profile-section">
                  <div class="section-title"><h2>Pengalaman kerja</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('experience')"><app-icon name="plus" [size]="16"></app-icon> Tambah</button></div>
                  <div class="timeline" *ngIf="profile.workExperiences.length; else emptyExperience">
                    <article class="timeline-item" *ngFor="let item of profile.workExperiences; let i = index">
                      <span class="timeline-mark"><app-icon name="briefcase"></app-icon></span>
                      <div>
                        <h3>{{ item.position }} <button class="icon-btn" (click)="openDrawer('experience', i)" [attr.aria-label]="'Ubah ' + item.position"><app-icon name="edit" [size]="15"></app-icon></button></h3>
                        <p class="org">{{ item.companyName }}</p>
                        <p class="desc" *ngIf="item.description">{{ item.description }}</p>
                        <div class="chips" *ngIf="item.details?.skills?.length || item.details?.tools?.length" style="margin-top: 10px">
                          <span class="chip" *ngFor="let skill of (item.details?.skills || []).concat(item.details?.tools || [])">{{ skill }}</span>
                        </div>
                      </div>
                      <time>{{ monthYear(item.startDate) }} – {{ item.currentJob ? 'sekarang' : monthYear(item.endDate) }}</time>
                    </article>
                  </div>
                  <ng-template #emptyExperience>
                    <p class="muted">{{ profile.profileDetails?.noExperience ? 'Belum memiliki pengalaman kerja.' : 'Belum ada pengalaman kerja yang ditambahkan.' }}</p>
                  </ng-template>
                </section>

                <section id="education" class="profile-section">
                  <div class="section-title"><h2>Pendidikan</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('education')"><app-icon name="plus" [size]="16"></app-icon> Tambah</button></div>
                  <div class="timeline" *ngIf="formalEducations.length; else emptyEducation">
                    <article class="timeline-item" *ngFor="let item of formalEducations">
                      <span class="timeline-mark"><app-icon name="grad"></app-icon></span>
                      <div>
                        <h3>{{ item.institution }} <button class="icon-btn" (click)="openEducationDrawer('education', item)" [attr.aria-label]="'Ubah ' + item.institution"><app-icon name="edit" [size]="15"></app-icon></button></h3>
                        <p class="org">{{ joinParts(item.level, item.major) }}</p>
                        <p class="desc" *ngIf="item.ipk">IPK {{ item.ipk }}</p>
                        <p class="desc" *ngIf="item.description">{{ item.description }}</p>
                      </div>
                      <time>{{ item.startYear || '-' }} – {{ item.endYear || 'sekarang' }}</time>
                    </article>
                  </div>
                  <ng-template #emptyEducation><p class="muted">Belum ada pendidikan formal yang ditambahkan.</p></ng-template>
                  <ng-container *ngIf="profile.supportingDocuments?.length">
                    <p class="subhead">Dokumen pendukung</p>
                    <div class="doc-list">
                      <button type="button" class="doc" *ngFor="let doc of profile.supportingDocuments" (click)="downloadSupportingDocument(doc.key, doc.originalName)">
                        <app-icon name="file"></app-icon>
                        <span><strong>{{ supportingDocumentLabel(doc.key) }}</strong><small>{{ doc.originalName }}</small></span>
                        <app-icon name="download" [size]="16"></app-icon>
                      </button>
                    </div>
                  </ng-container>
                </section>

                <section id="training" class="profile-section">
                  <div class="section-title"><h2>Pelatihan &amp; sertifikasi</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('training')"><app-icon name="plus" [size]="16"></app-icon> Tambah</button></div>
                  <div class="timeline" *ngIf="informalEducations.length || profile.profileDetails?.trainingCertifications?.length; else emptyTraining">
                    <article class="timeline-item" *ngFor="let item of profile.profileDetails?.trainingCertifications || []">
                      <span class="timeline-mark"><app-icon name="award"></app-icon></span>
                      <div>
                        <h3>{{ item.name }}</h3>
                        <p class="org">{{ joinParts(item.issuingOrganization, item.credentialId ? 'No. ' + item.credentialId : '') }}</p>
                        <p class="desc">{{ certificationDates(item.issueDate, item.expiryDate) }}</p>
                        <a *ngIf="item.credentialUrl" class="link" style="font-size: 14px; margin-top: 6px" [href]="item.credentialUrl" target="_blank" rel="noopener noreferrer">Lihat sertifikat <app-icon name="arrow-up-right" [size]="14"></app-icon></a>
                      </div>
                    </article>
                    <article class="timeline-item" *ngFor="let item of informalEducations">
                      <span class="timeline-mark"><app-icon name="award"></app-icon></span>
                      <div>
                        <h3>{{ item.major || item.level }} <button class="icon-btn" (click)="openEducationDrawer('training', item)" [attr.aria-label]="'Ubah ' + (item.major || item.level)"><app-icon name="edit" [size]="15"></app-icon></button></h3>
                        <p class="org">{{ item.institution }}</p>
                        <p class="desc" *ngIf="item.description">{{ item.description }}</p>
                      </div>
                      <time>{{ item.startYear || '-' }}{{ item.endYear && item.endYear !== item.startYear ? ' – ' + item.endYear : '' }}</time>
                    </article>
                  </div>
                  <ng-template #emptyTraining><p class="muted">Belum ada pelatihan atau sertifikasi.</p></ng-template>
                </section>

                <section id="additional" class="profile-section">
                  <div class="section-title"><h2>Informasi tambahan</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('additional')"><app-icon name="edit" [size]="16"></app-icon> Ubah</button></div>
                  <dl class="facts two">
                    <div><dt>Ekspektasi gaji per bulan</dt><dd>{{ salaryRange(profile.expectedSalary, profile.profileDetails?.expectedSalaryMax) }}</dd></div>
                    <div><dt>Fungsi yang diminati</dt><dd>{{ profile.jobInterests.join(', ') || '-' }}</dd></div>
                    <div><dt>Lokasi kerja yang diminati</dt><dd>{{ profile.preferredLocations.join(', ') || '-' }}</dd></div>
                    <div><dt>Kemampuan bahasa</dt><dd>{{ languageSummary }}</dd></div>
                    <div><dt>LinkedIn</dt><dd>{{ profile.profileDetails?.linkedinUrl || '-' }}</dd></div>
                    <div><dt>Media sosial</dt><dd>{{ joinParts(profile.profileDetails?.socialPlatform, profile.profileDetails?.socialUsername) }}</dd></div>
                  </dl>
                  <ng-container *ngIf="profile.tools.length">
                    <p class="subhead">Tools yang dikuasai</p>
                    <div class="chips"><span class="chip" *ngFor="let tool of profile.tools">{{ tool }}</span></div>
                  </ng-container>
                </section>
              </section>

            </div>

            <aside class="profile-side">
              <section class="side-card">
                <h2>Data pribadi <button class="btn btn-ghost btn-sm" (click)="openDrawer('profile')" aria-label="Ubah data pribadi"><app-icon name="edit" [size]="16"></app-icon></button></h2>
                <app-talent-profile-details [profile]="profile" [showAdditionalInformation]="false" [showEducationInformation]="false"></app-talent-profile-details>
              </section>

              <section class="side-card">
                <h2>Jadwal interview</h2>
                <div *ngIf="interviews.length; else noInterview">
                  <article class="interview-item" *ngFor="let item of interviews">
                    <div style="display: flex; justify-content: space-between; gap: 8px; align-items: flex-start">
                      <strong>{{ item.jobTitle || 'Interview Talent Pool' }}</strong>
                      <span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span>
                    </div>
                    <p><app-icon name="clock" [size]="15"></app-icon>{{ fmt.fullDate(item.scheduledAt) }}, {{ fmt.time(item.scheduledAt) }} · {{ item.durationMinutes }} menit</p>
                    <p><app-icon [name]="item.mode === 'ONLINE' ? 'video' : item.mode === 'PHONE' ? 'phone' : 'pin'" [size]="15"></app-icon>{{ item.locationOrLink || fmt.label(item.mode) }}</p>
                  </article>
                </div>
                <ng-template #noInterview><p class="muted" style="font-size: 14px">Belum ada jadwal interview.</p></ng-template>
              </section>

              <section class="side-card">
                <h2>Aktivitas recruiter</h2>
                <div class="activity" *ngIf="activities.length; else noActivity">
                  <div *ngFor="let item of activities">
                    <app-icon [name]="item.type === 'CV_VIEW' ? 'file' : 'eye'" [size]="16"></app-icon>
                    <div><strong>{{ item.message }}</strong><small>{{ fmt.fullDate(item.viewedAt) }}, {{ fmt.time(item.viewedAt) }}</small></div>
                  </div>
                </div>
                <ng-template #noActivity><p class="muted" style="font-size: 14px">Belum ada recruiter yang melihat profil Anda.</p></ng-template>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <div class="drawer-backdrop" *ngIf="applicationHistoryOpen" (click)="closeApplicationHistoryOnBackdrop($event)">
        <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="history-title">
          <header class="drawer-head">
            <div>
              <h2 id="history-title">{{ selectedApplication?.jobTitle || 'Riwayat lamaran' }}</h2>
              <p>Riwayat proses rekrutmen untuk lowongan ini.</p>
            </div>
            <button class="icon-btn" (click)="closeApplicationHistory()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>
          <div class="drawer-body">
            <p class="muted" *ngIf="applicationHistoryLoading">Memuat riwayat…</p>
            <div class="timeline" *ngIf="!applicationHistoryLoading && applicationHistory.length">
              <article class="timeline-item" *ngFor="let item of applicationHistory">
                <span class="timeline-mark"><app-icon name="check" [size]="16"></app-icon></span>
                <div>
                  <h3>{{ historyTitle(item) }}</h3>
                  <p class="desc">{{ historyDescription(item) }}</p>
                </div>
                <time>{{ fmt.fullDate(item.changedAt) }}</time>
              </article>
            </div>
            <p class="muted" *ngIf="!applicationHistoryLoading && !applicationHistory.length">Belum ada riwayat proses.</p>
          </div>
        </aside>
      </div>

      <div class="drawer-backdrop" *ngIf="drawerOpen" (click)="backdropClose($event)">
        <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
          <header class="drawer-head">
            <div>
              <h2 id="drawer-title">{{ drawerTitle }}</h2>
              <p>Perubahan langsung terlihat oleh tim rekrutmen.</p>
            </div>
            <button class="icon-btn" (click)="cancelDrawer()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>

          <div class="drawer-body">
            <div class="form-stack" *ngIf="drawerSection === 'profile'">
              <div class="photo-edit">
                <span class="avatar avatar-lg">
                  <img *ngIf="profilePicturePreview || profilePictureUrl; else photoInitials" [src]="profilePicturePreview || profilePictureUrl" alt="">
                  <ng-template #photoInitials>{{ fmt.initials(profile.fullName) }}</ng-template>
                </span>
                <div>
                  <strong>Foto profil</strong>
                  <p>JPG atau PNG.</p>
                  <label class="btn btn-secondary btn-sm">
                    Pilih foto
                    <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" (change)="onProfilePictureSelected($event)" hidden>
                  </label>
                  <small class="field-hint" *ngIf="profilePictureFile" style="display: block; margin-top: 6px">{{ profilePictureFile.name }}</small>
                </div>
              </div>
              <label class="field">Nama lengkap<input [(ngModel)]="profile.fullName"></label>
              <label class="field">Email<input [ngModel]="profile.email" disabled><small>Email dipakai untuk masuk dan tidak dapat diubah.</small></label>
              <label class="field">Nomor WhatsApp<input type="tel" [(ngModel)]="profile.phone"></label>
              <label class="field">Agama<input [(ngModel)]="profile.religion"></label>
              <label class="field">Lokasi kerja yang diminati<input [ngModel]="profile.preferredLocations.join(', ')" (ngModelChange)="profile.preferredLocations = splitList($event)"><small>Pisahkan dengan koma, maksimal 3.</small></label>
              <label class="field">Posisi yang diminati<input [ngModel]="profile.relatedJobPositions.join(', ')" (ngModelChange)="profile.relatedJobPositions = splitList($event)"><small>Pisahkan dengan koma, maksimal 3.</small></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'about'">
              <label class="field">Tentang saya<textarea rows="10" [(ngModel)]="profile.about" maxlength="4000"></textarea><small>{{ (profile.about || '').length }} / 4000 karakter</small></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'experience' && editExperience">
              <label class="field">Posisi<input [(ngModel)]="editExperience.position"></label>
              <label class="field">Perusahaan<input [(ngModel)]="editExperience.companyName"></label>
              <div class="form-grid">
                <label class="field">Mulai<input type="date" [(ngModel)]="editExperience.startDate"></label>
                <label class="field">Selesai<input type="date" [(ngModel)]="editExperience.endDate" [disabled]="editExperience.currentJob"></label>
              </div>
              <label class="check"><input type="checkbox" [(ngModel)]="editExperience.currentJob"> Saya masih bekerja di sini</label>
              <label class="field">Tugas dan pencapaian<textarea rows="5" [(ngModel)]="editExperience.description"></textarea></label>
            </div>

            <div class="form-stack" *ngIf="(drawerSection === 'education' || drawerSection === 'training') && editEducation">
              <label class="field" *ngIf="drawerSection === 'education'">Institusi<input [(ngModel)]="editEducation.institution"></label>
              <label class="field" *ngIf="drawerSection === 'education'">Jurusan<input [(ngModel)]="editEducation.major"></label>
              <label class="field" *ngIf="drawerSection === 'training'">Nama pelatihan atau sertifikasi<input [(ngModel)]="editEducation.major"></label>
              <label class="field" *ngIf="drawerSection === 'training'">Penyelenggara<input [(ngModel)]="editEducation.institution"></label>
              <label class="field">{{ drawerSection === 'education' ? 'Jenjang' : 'Jenis' }}<input [(ngModel)]="editEducation.level"></label>
              <div class="form-grid">
                <label class="field">Tahun mulai<input type="number" [(ngModel)]="editEducation.startYear"></label>
                <label class="field">Tahun selesai<input type="number" [(ngModel)]="editEducation.endYear"></label>
              </div>
              <label class="field">Keterangan<textarea [(ngModel)]="editEducation.description"></textarea></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'additional'">
              <label class="field">Ekspektasi gaji minimum per bulan<input type="number" [(ngModel)]="profile.expectedSalary"></label>
              <label class="field">Fungsi yang diminati<input [ngModel]="profile.jobInterests.join(', ')" (ngModelChange)="profile.jobInterests = splitList($event)"><small>Pisahkan dengan koma, maksimal 3.</small></label>
              <label class="field">Lokasi kerja yang diminati<input [ngModel]="profile.preferredLocations.join(', ')" (ngModelChange)="profile.preferredLocations = splitList($event)"><small>Pisahkan dengan koma, maksimal 3.</small></label>
              <label class="field">Industri<input [ngModel]="profile.relatedIndustries.join(', ')" (ngModelChange)="profile.relatedIndustries = splitList($event)"><small>Pisahkan dengan koma, maksimal 3.</small></label>
              <label class="field">Tools<input [ngModel]="profile.tools.join(', ')" (ngModelChange)="profile.tools = splitList($event, 20)"><small>Pisahkan dengan koma.</small></label>
              <label class="field">Bahasa<input [(ngModel)]="profile.languanges"></label>
              <label class="field">LinkedIn<input [ngModel]="profile.profileDetails?.linkedinUrl || ''" (ngModelChange)="setLinkedInUrl($event)" type="url" placeholder="https://www.linkedin.com/in/…"></label>
            </div>
          </div>

          <footer class="drawer-foot">
            <button class="btn btn-secondary" (click)="cancelDrawer()" [disabled]="saving">Batal</button>
            <button class="btn btn-primary" (click)="saveDrawer()" [disabled]="saving">{{ saving ? 'Menyimpan…' : 'Simpan perubahan' }}</button>
          </footer>
        </aside>
      </div>
    </div>

    <ng-template #loadingTpl><div class="full-loading">Memuat profil…</div></ng-template>
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
  saving = false;
  readonly fmt = FMT;
  readonly tabs = [
    { id: 'about', label: 'Tentang' },
    { id: 'experiences', label: 'Pengalaman' },
    { id: 'education', label: 'Pendidikan' },
    { id: 'training', label: 'Sertifikasi' },
    { id: 'additional', label: 'Info tambahan' },
  ];
  activeSection = 'about';
  private tabClickedAt = 0;
  private readonly profileSectionIds = ['about', 'experiences', 'education', 'training', 'additional'];
  applicationSubmitted = false;
  applicationHistoryOpen = false;
  applicationHistoryLoading = false;
  applicationHistory: any[] = [];
  selectedApplication: JobApplication | null = null;
  applicationStages = [
    { value: 'NEW_CANDIDATE', label: 'Dikirim' },
    { value: 'SCREENING', label: 'Screening' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'OFFER', label: 'Penawaran' },
    { value: 'HIRED', label: 'Diterima' },
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
    this.activeSection = id;
    this.tabClickedAt = Date.now();
    this.revealActiveTab();
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  @HostListener('window:scroll')
  syncActiveSection(): void {
    // Ignore scroll events caused by a tab click until its smooth scroll settles.
    if (Date.now() - this.tabClickedAt < 900) return;
    const offset = 140;
    let current = this.profileSectionIds[0];
    for (const id of this.profileSectionIds) {
      const top = document.getElementById(id)?.getBoundingClientRect().top;
      if (top != null && top - offset <= 0) current = id;
    }
    if (current !== this.activeSection) {
      this.activeSection = current;
      this.revealActiveTab();
    }
  }

  private revealActiveTab(): void {
    setTimeout(() => {
      const tab = document.querySelector('.profile-tabs button.active') as HTMLElement | null;
      const bar = tab?.parentElement;
      if (!tab || !bar || bar.scrollWidth <= bar.clientWidth) return;
      bar.scrollTo({ left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    });
  }

  monthYear(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  }

  private fullDate(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  certificationDates(issueDate: string | null | undefined, expiryDate: string | null | undefined): string {
    const issued = this.fullDate(issueDate);
    const expires = this.fullDate(expiryDate);
    return [issued && `Terbit ${issued}`, expires ? `Kedaluwarsa ${expires}` : (issued ? 'Tanpa masa berlaku' : '')]
      .filter(Boolean).join(' · ') || '-';
  }

  joinParts(...parts: Array<string | null | undefined>): string {
    return parts.map((part) => (part || '').trim()).filter(Boolean).join(', ') || '-';
  }

  salaryRange(min: number | null | undefined, max: number | null | undefined): string {
    const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    if (min == null && max == null) return '-';
    if (min != null && max != null && min !== max) return `${rupiah(min)} – ${rupiah(max)}`;
    return rupiah((min ?? max) as number);
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
  get firstPortfolio(): string { return this.profile?.portfolios?.find((item) => item.url)?.title || ''; }
  get headline(): string {
    const current = this.profile?.workExperiences?.find((item) => item.currentJob);
    if (current) return `${current.position} di ${current.companyName}`;
    return this.profile?.relatedJobPositions?.[0] || 'Kandidat Talent Pool Sarinah';
  }
  get drawerTitle(): string {
    const map: Record<DrawerSection, string> = {
      profile: 'Ubah profil',
      about: 'Tentang saya',
      experience: this.drawerIndex == null ? 'Tambah pengalaman kerja' : 'Ubah pengalaman kerja',
      education: this.drawerIndex == null ? 'Tambah pendidikan' : 'Ubah pendidikan',
      training: this.drawerIndex == null ? 'Tambah pelatihan' : 'Ubah pelatihan',
      additional: 'Informasi tambahan',
    };
    return this.drawerSection ? map[this.drawerSection] : '';
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  splitList(value: string, limit = 3): string[] {
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, limit);
  }

  get languageSummary(): string {
    const skills = this.profile?.profileDetails?.languageSkills || [];
    if (skills.length) return skills.map((item) => `${item.name} (${item.proficiency.toLowerCase()})`).join(', ');
    return this.profile?.languanges || '-';
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

  setLinkedInUrl(value: string): void {
    this.profile.profileDetails ||= {
      gender: '', postalCode: '', region: '', linkedinUrl: '', socialPlatform: '', socialUsername: '',
      expectedSalaryMax: null, noExperience: false, languageSkills: [], trainingCertifications: [],
    };
    this.profile.profileDetails.linkedinUrl = value;
  }

  openEducationDrawer(section: 'education' | 'training', item: EducationItem): void {
    const index = this.profile.educations.indexOf(item);
    this.openDrawer(section, index >= 0 ? index : null);
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
