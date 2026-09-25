import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CandidateProfile, EducationItem, JobApplication, WorkExperienceItem } from '../../core/models/talent.models';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';

type DrawerSection = 'profile' | 'about' | 'experience' | 'education' | 'training' | 'additional';

@Component({
  selector: 'app-candidate-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="portal-page" *ngIf="profile; else loadingTpl">
      <header class="career-header">
        <img class="danantara-logo" src="images/Danantara_Indonesia.png" alt="Danantara Indonesia">
        <nav><a routerLink="/">Home</a><a routerLink="/open-positions">Open Positions</a></nav>
        <div class="career-header-right">
          <span class="portal-user">{{ profile.fullName }}</span>
          <button class="text-button" (click)="auth.logout()">Keluar</button>
          <img class="sarinah-logo" src="images/sarinah.png" alt="Sarinah">
        </div>
      </header>

      <main class="profile-container">
        <section class="profile-hero-card">
          <div class="profile-main">
            <div class="profile-avatar">{{ initials(profile.fullName) }}</div>
            <div>
              <h1>{{ profile.fullName }}</h1>
              <p>{{ headline }}</p>
            </div>
            <div class="profile-actions">
              <span class="availability"><i></i>{{ profile.status || 'POTENTIAL' }}</span>
              <button class="outline-button" (click)="openDrawer('profile')">✎ Edit Profil</button>
            </div>
          </div>
          <div class="contact-grid">
            <span>✉ {{ profile.email }}</span>
            <span>☎ {{ profile.phone || '-' }}</span>
            <span>⌖ {{ profile.preferredLocations?.length ? profile.preferredLocations.join(', ') : 'Lokasi belum ditentukan' }}</span>
            <span>↗ {{ firstPortfolio || 'Portfolio belum ditambahkan' }}</span>
          </div>
        </section>

        <section class="profile-content-card">
          <nav class="profile-tabs">
            <a href="#about">About</a>
            <a href="#experiences">Experiences</a>
            <a href="#education">Education</a>
            <a href="#training">Training & Certification</a>
            <a href="#additional">Additional Information</a>
          </nav>

          <div class="profile-sections">
            <section id="about" class="profile-section">
              <div class="section-title"><h2>About</h2><button (click)="openDrawer('about')">✎ Edit</button></div>
              <p class="about-copy">{{ profile.about || 'Tambahkan ringkasan profesional Anda agar recruiter lebih mudah memahami profil Anda.' }}</p>
            </section>

            <section id="experiences" class="profile-section">
              <div class="section-title"><h2>Work Experience</h2><button (click)="openDrawer('experience')">＋ Add</button></div>
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
              <div class="section-title"><h2>Education</h2><button (click)="openDrawer('education')">＋ Add</button></div>
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
            </section>

            <section id="training" class="profile-section">
              <div class="section-title"><h2>Training & Certification</h2><button (click)="openDrawer('training')">＋ Add</button></div>
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
              <div class="empty-state" *ngIf="!informalEducations.length">Belum ada training atau sertifikasi.</div>
            </section>

            <section id="additional" class="profile-section">
              <div class="section-title"><h2>Additional Information</h2><button (click)="openDrawer('additional')">✎ Edit</button></div>
              <div class="info-grid">
                <article><span>Languages</span><strong>{{ profile.languanges || '-' }}</strong></article>
                <article><span>Religion</span><strong>{{ profile.religion || '-' }}</strong></article>
                <article><span>Expected Salary</span><strong>{{ profile.expectedSalary || '-' }}</strong></article>
                <article><span>Job Interests</span><strong>{{ profile.jobInterests?.join(', ') || '-' }}</strong></article>
                <article><span>Preferred Locations</span><strong>{{ profile.preferredLocations?.join(', ') || '-' }}</strong></article>
                <article><span>Tools / Skills</span><strong>{{ profile.tools?.join(', ') || '-' }}</strong></article>
              </div>
            </section>
          </div>
        </section>

        <section class="applications-card">
          <div class="section-title"><h2>Lamaran Saya</h2><a routerLink="/open-positions">Lihat Lowongan</a></div>
          <article class="application-row" *ngFor="let app of applications">
            <div><h3>{{ app.jobTitle }}</h3><p>{{ app.stage || '-' }}</p></div>
            <span>{{ app.status || '-' }}</span>
          </article>
          <div class="empty-state" *ngIf="!applications.length">Belum ada lamaran.</div>
        </section>
      </main>

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
              <label>Nama Lengkap<input [(ngModel)]="profile.fullName"></label>
              <label>Email<input [ngModel]="profile.email" disabled></label>
              <label>WhatsApp<input [(ngModel)]="profile.phone"></label>
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
              <label>Religion<input [(ngModel)]="profile.religion"></label>
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
  drawerOpen = false;
  drawerSection: DrawerSection | null = null;
  drawerIndex: number | null = null;
  snapshot: CandidateProfile | null = null;
  editExperience: WorkExperienceItem | null = null;
  editEducation: EducationItem | null = null;
  saving = false;

  constructor(public auth: TalentAuthService, private portal: TalentPortalService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.portal.profile().subscribe((profile) => this.profile = profile);
    this.portal.applications().subscribe((result) => this.applications = result?.content || []);
  }

  get formalEducations(): EducationItem[] { return (this.profile?.educations || []).filter((item) => item.type === 'FORMAL'); }
  get informalEducations(): EducationItem[] { return (this.profile?.educations || []).filter((item) => item.type === 'INFORMAL'); }
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

    if (section === 'experience') {
      this.editExperience = index == null
        ? { companyName: '', position: '', startDate: '', endDate: '', currentJob: false, description: '' }
        : structuredClone(this.profile.workExperiences[index]);
    }

    if (section === 'education' || section === 'training') {
      this.editEducation = {
        type: section === 'training' ? 'INFORMAL' : 'FORMAL',
        institution: '',
        level: '',
        major: '',
        startYear: null,
        endYear: null,
        description: '',
        ipk: null,
      };
    }

    this.drawerOpen = true;
  }

  openEducationDrawer(section: 'education' | 'training', item: EducationItem): void {
    this.snapshot = structuredClone(this.profile);
    this.drawerSection = section;
    this.drawerIndex = this.profile.educations.findIndex((education) => education.id === item.id);
    this.editEducation = structuredClone(item);
    this.drawerOpen = true;
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
    this.portal.saveProfile(this.profile).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.saving = false;
        this.closeDrawer();
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
  }
}
