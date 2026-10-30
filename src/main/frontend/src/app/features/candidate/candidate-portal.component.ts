import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TalentProfileDetailsComponent } from '../../shared/talent-profile-details.component';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CandidateProfile, EducationItem, JobApplication, SupportingUpload, TrainingCertification, WorkExperienceItem } from '../../core/models/talent.models';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';
import { WordLimitDirective } from '../../shared/word-limit.directive';
import { SearchSelectComponent } from '../../shared/search-select.component';
import { PostalRegionFieldComponent } from '../../shared/postal-region-field.component';
import { SocialAccountsFieldComponent } from '../../shared/social-accounts-field.component';
import { cleanSocial, socialError, socialList } from '../../shared/social-accounts';
import { ChoiceFieldComponent } from '../../shared/choice-field.component';
import { TagSelectComponent } from '../../shared/tag-select.component';
import { TALENT_OPTIONS } from '../../shared/talent-options';
import { translate } from '../../core/i18n/translator';

type DrawerSection = 'header' | 'personal' | 'interest' | 'about' | 'experience' | 'education' | 'training' | 'certification' | 'additional';

@Component({
  selector: 'app-candidate-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CareerHeaderComponent, TalentProfileDetailsComponent, IconComponent, ChoiceFieldComponent, SearchSelectComponent, WordLimitDirective, TagSelectComponent, PostalRegionFieldComponent, SocialAccountsFieldComponent],
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
              <button class="btn btn-secondary" (click)="openDrawer('header')"><app-icon name="edit" [size]="16"></app-icon> Ubah profil</button>
            </div>
          </section>

          <div class="profile-layout">
            <div class="profile-main">
              <section class="profile-card">
                <nav class="profile-tabs" aria-label="Bagian profil">
                  <button type="button" *ngFor="let tab of tabs" [class.active]="activeSection === tab.id"
                    [attr.aria-current]="activeSection === tab.id ? 'true' : null" (click)="scrollToSection(tab.id)">{{ tab.label }}</button>
                </nav>

                <section id="about" class="profile-section">
                  <div class="section-title"><h2>Tentang saya</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('about')"><app-icon name="edit" [size]="16"></app-icon> Ubah</button></div>
                  <p class="about-copy" [class.placeholder]="!profile.about">{{ profile.about || 'Tulis ringkasan singkat tentang pengalaman dan tujuan karier Anda agar recruiter cepat memahami profil Anda.' }}</p>
                  <div class="interest-box">
                    <span class="interest-icon"><app-icon name="award" [size]="20"></app-icon></span>
                    <div><strong>Minat Karier</strong><p>{{ profile.jobInterests.length ? profile.jobInterests.join('  •  ') : 'Belum dipilih' }}</p></div>
                    <button type="button" class="btn btn-ghost btn-sm interest-edit" (click)="openDrawer('interest')" aria-label="Ubah minat karier"><app-icon name="edit" [size]="16"></app-icon> Ubah</button>
                  </div>
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
                  <ng-container *ngIf="educationDocuments.length">
                    <p class="subhead">Dokumen pendukung</p>
                    <div class="doc-list">
                      <button type="button" class="doc" *ngFor="let doc of educationDocuments" (click)="downloadSupportingDocument(doc.key, doc.originalName)">
                        <app-icon name="file"></app-icon>
                        <span><strong>{{ supportingDocumentLabel(doc.key) }}</strong><small>{{ doc.originalName }}</small></span>
                        <app-icon name="download" [size]="16"></app-icon>
                      </button>
                    </div>
                  </ng-container>
                </section>

                <section id="training" class="profile-section">
                  <div class="section-title"><h2>Pelatihan</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('training')"><app-icon name="plus" [size]="16"></app-icon> Tambah</button></div>
                  <div class="timeline" *ngIf="informalEducations.length; else emptyTraining">
                    <article class="timeline-item" *ngFor="let item of informalEducations">
                      <span class="timeline-mark"><app-icon name="award"></app-icon></span>
                      <div>
                        <h3>{{ item.major || item.level }} <button class="icon-btn" (click)="openEducationDrawer('training', item)" [attr.aria-label]="'Ubah ' + (item.major || item.level)"><app-icon name="edit" [size]="15"></app-icon></button></h3>
                        <p class="org">{{ joinParts(item.level, item.institution) }}</p>
                        <p class="desc" *ngIf="item.description">{{ item.description }}</p>
                      </div>
                      <time>{{ item.startYear || '-' }}</time>
                    </article>
                  </div>
                  <ng-template #emptyTraining><p class="muted">{{ profile.profileDetails?.noTraining ? 'Tidak memiliki pelatihan.' : 'Belum ada pelatihan.' }}</p></ng-template>
                </section>

                <section id="certification" class="profile-section">
                  <div class="section-title"><h2>Sertifikasi</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('certification')"><app-icon name="plus" [size]="16"></app-icon> Tambah</button></div>
                  <div class="timeline" *ngIf="certifications.length; else emptyCertification">
                    <article class="timeline-item" *ngFor="let item of certifications; let i = index">
                      <span class="timeline-mark"><app-icon name="award"></app-icon></span>
                      <div>
                        <h3>{{ item.name }} <button class="icon-btn" (click)="openDrawer('certification', i)" [attr.aria-label]="'Ubah ' + item.name"><app-icon name="edit" [size]="15"></app-icon></button></h3>
                        <p class="org">{{ joinParts(item.issuingOrganization, item.credentialId ? 'No. ' + item.credentialId : '') }}</p>
                        <p class="desc">{{ certificationDates(item.issueDate, item.expiryDate) }}</p>
                        <button type="button" class="link" *ngIf="certificateDocument(item) as doc" style="font-size: 14px; margin-top: 6px; border: 0; background: none; padding: 0; cursor: pointer" (click)="downloadSupportingDocument(doc.key, doc.originalName)">Lihat sertifikat <app-icon name="download" [size]="14"></app-icon></button>
                        <a *ngIf="item.credentialUrl" class="link" style="font-size: 14px; margin-top: 6px" [href]="item.credentialUrl" target="_blank" rel="noopener noreferrer">Lihat sertifikat <app-icon name="arrow-up-right" [size]="14"></app-icon></a>
                      </div>
                    </article>
                  </div>
                  <ng-template #emptyCertification><p class="muted">{{ profile.profileDetails?.noCertification ? 'Tidak memiliki sertifikasi.' : 'Belum ada sertifikasi.' }}</p></ng-template>
                </section>

                <section id="additional" class="profile-section">
                  <div class="section-title"><h2>Informasi tambahan</h2><button class="btn btn-ghost btn-sm" (click)="openDrawer('additional')"><app-icon name="edit" [size]="16"></app-icon> Ubah</button></div>
                  <dl class="facts two">
                    <div><dt>Ekspektasi gaji per bulan</dt><dd>{{ salaryRange(profile.expectedSalary, profile.profileDetails?.expectedSalaryMax) }}</dd></div>
                    <div><dt>Fungsi yang diminati</dt><dd>{{ profile.jobInterests.join(', ') || '-' }}</dd></div>
                    <div><dt>Lokasi kerja yang diminati</dt><dd>{{ profile.preferredLocations.join(', ') || '-' }}</dd></div>
                    <div><dt>Kemampuan bahasa</dt><dd>{{ languageSummary }}</dd></div>
                    <div><dt>LinkedIn</dt><dd>{{ profile.profileDetails?.linkedinUrl || '-' }}</dd></div>
                    <div><dt>Media sosial</dt><dd><span class="line" *ngFor="let item of socials">{{ item }}</span><ng-container *ngIf="!socials.length">-</ng-container></dd></div>
                  </dl>
                </section>
              </section>

              <section id="my-applications" class="profile-card profile-section">
                <div class="section-title"><h2>Lamaran saya</h2><a class="btn btn-secondary btn-sm" routerLink="/" fragment="open-positions">Cari lowongan</a></div>
                <div class="app-list" *ngIf="applications.length; else noApplications">
                  <article class="app" *ngFor="let app of visibleApplications">
                    <div>
                      <h3>{{ app.jobTitle }}</h3>
                      <p class="when">Dilamar {{ fmt.fullDate(app.appliedAt) }}</p>
                    </div>
                    <div class="app-actions">
                      <button type="button" class="btn btn-ghost btn-sm" (click)="openApplicationHistory(app)"><app-icon name="history" [size]="16"></app-icon> Riwayat</button>
                      <button *ngIf="canWithdraw(app)" type="button" class="btn btn-danger btn-sm" (click)="withdrawApplication(app)">Tarik lamaran</button>
                    </div>
                    <div class="stage-track" *ngIf="app.status !== 'REJECTED' && app.status !== 'WITHDRAWN'; else ended"
                      [style.gridTemplateColumns]="'repeat(' + visibleStages(app).length + ', minmax(0, 1fr))'"
                      [attr.aria-label]="'Tahap saat ini: ' + applicationStages[applicationStageIndex(app.stage)].label">
                      <div *ngFor="let stage of visibleStages(app); let i = index"
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
                <button type="button" class="btn btn-ghost btn-sm show-more" *ngIf="applications.length > applicationPreview" (click)="showAllApplications = !showAllApplications"
                  [attr.aria-expanded]="showAllApplications">
                  {{ showAllApplications ? 'Tampilkan lebih sedikit' : 'Lihat semua lamaran (' + applications.length + ')' }}
                  <app-icon [name]="showAllApplications ? 'chevron-up' : 'chevron-down'" [size]="16"></app-icon>
                </button>
                <ng-template #noApplications>
                  <div class="empty"><strong>Belum ada lamaran</strong>Lihat lowongan yang sedang dibuka dan lamar dengan profil ini.</div>
                </ng-template>

                <div class="app-interviews">
                  <h3 class="subhead">Jadwal interview</h3>
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
                </div>
              </section>
            </div>

            <aside class="profile-side">
              <section class="side-card">
                <h2>Data pribadi <button class="btn btn-ghost btn-sm" (click)="openDrawer('personal')" aria-label="Ubah data pribadi"><app-icon name="edit" [size]="16"></app-icon></button></h2>
                <app-talent-profile-details [profile]="profile" [showAdditionalInformation]="false" [showEducationInformation]="false"></app-talent-profile-details>
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
            <p class="alert alert-error" *ngIf="drawerError" role="alert" style="margin-bottom: 16px"><app-icon name="alert"></app-icon><span>{{ drawerError }}</span></p>
            <div class="form-stack" *ngIf="drawerSection === 'header'">
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
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'personal'">
              <label class="field">Jenis kelamin<app-choice-field [options]="options.genders" [allowOther]="false" label="Jenis kelamin" [value]="profile.profileDetails?.gender" (valueChange)="setDetail('gender', $event)"></app-choice-field></label>
              <label class="field">Agama<app-choice-field [options]="options.religions" [allowOther]="false" label="Agama" [(value)]="profile.religion"></app-choice-field></label>
              <label class="field">Alamat KTP<textarea rows="3" [(ngModel)]="profile.citizenIdAddress" [wordLimit]="40" placeholder="Nama jalan, nomor rumah, RT/RW"></textarea></label>
              <app-postal-region-field codeLabel="Kode pos KTP" regionLabel="Kelurahan, kecamatan, kota"
                [postalCode]="profile.profileDetails?.postalCode" [region]="profile.profileDetails?.region"
                (postalCodeChange)="setDetail('postalCode', $event)" (regionChange)="setDetail('region', $event)"></app-postal-region-field>
              <label class="check"><input type="checkbox" [(ngModel)]="profile.sameAsCitizenIdAddress"> Alamat domisili sama dengan alamat KTP</label>
              <label class="field" *ngIf="!profile.sameAsCitizenIdAddress">Alamat domisili<textarea rows="3" [(ngModel)]="profile.residentialAddress" [wordLimit]="40"></textarea></label>
              <app-postal-region-field *ngIf="!profile.sameAsCitizenIdAddress" codeLabel="Kode pos domisili" regionLabel="Kelurahan, kecamatan, kota domisili"
                [postalCode]="profile.profileDetails?.residentialPostalCode" [region]="profile.profileDetails?.residentialRegion"
                (postalCodeChange)="setDetail('residentialPostalCode', $event)" (regionChange)="setDetail('residentialRegion', $event)"></app-postal-region-field>
              <label class="field">Tahu Sarinah dari<app-choice-field [options]="options.sources" label="Sumber" [(value)]="profile.source"></app-choice-field></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'interest'">
              <label class="field">Fungsi yang diminati<app-tag-select [options]="options.functions" label="Fungsi" [limit]="3" [(value)]="profile.jobInterests"></app-tag-select><small>Pilih maksimal 3 fungsi.</small></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'about'">
              <label class="field">Tentang saya<textarea rows="10" [(ngModel)]="profile.about" [wordLimit]="150" placeholder="Tulis ringkasan singkat tentang pengalaman dan tujuan karier Anda agar recruiter cepat memahami profil Anda." maxlength="500"></textarea><small>{{ (profile.about || '').length }} / 500 karakter</small></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'experience' && editExperience">
              <label class="field">Posisi<input [(ngModel)]="editExperience.position"></label>
              <label class="field">Perusahaan<input [(ngModel)]="editExperience.companyName"></label>
              <div class="form-grid">
                <label class="field">Status kepegawaian<app-choice-field [options]="options.employmentTypes" [allowOther]="false" label="Status kepegawaian" [(value)]="expDetails.employmentType"></app-choice-field></label>
                <label class="field">Industri<app-choice-field [options]="options.industries" label="Industri" [(value)]="expDetails.industry"></app-choice-field></label>
              </div>
              <div class="form-grid">
                <label class="field">Mulai<input type="date" [(ngModel)]="editExperience.startDate"></label>
                <label class="field">Selesai<input type="date" [(ngModel)]="editExperience.endDate" [disabled]="editExperience.currentJob"></label>
              </div>
              <label class="check"><input type="checkbox" [(ngModel)]="editExperience.currentJob"> Saya masih bekerja di sini</label>
              <label class="field">Tugas dan pencapaian<textarea rows="5" [(ngModel)]="editExperience.description" [wordLimit]="120"></textarea></label>
              <label class="field">Keahlian<app-tag-select [options]="options.skills" label="Keahlian" [(value)]="expDetails.skills"></app-tag-select></label>
              <label class="field">Tools<app-tag-select [options]="options.tools" label="Tools" [(value)]="expDetails.tools"></app-tag-select></label>
              <label class="field" *ngIf="!editExperience.currentJob">Alasan berhenti<textarea rows="2" [(ngModel)]="expDetails.resignReason" [wordLimit]="50"></textarea></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'education' && editEducation">
              <label class="field">Institusi<app-search-select source="campus" [popular]="options.institutions" label="Institusi" placeholder="Ketik nama kampus, mis. University of Indonesia" [(value)]="editEducation.institution"></app-search-select></label>
              <label class="field">Jurusan<app-search-select source="major" [popular]="options.majors" label="Jurusan" placeholder="Ketik nama jurusan / program studi" [(value)]="editEducation.major"></app-search-select></label>
              <div class="form-grid">
                <label class="field">Jenjang<app-choice-field [options]="educationLevelOptions" [allowOther]="false" label="Jenjang" [(value)]="editEducation.level"></app-choice-field></label>
                <label class="field">IPK / nilai akhir<input [(ngModel)]="editEducation.ipk" inputmode="decimal" placeholder="Contoh: 3.50"></label>
              </div>
              <div class="form-grid">
                <label class="field">Tahun mulai<input type="number" [(ngModel)]="editEducation.startYear"></label>
                <label class="field">Tahun selesai<input type="number" [(ngModel)]="editEducation.endYear"></label>
              </div>
              <label class="file-field">Ijazah <input type="file" accept=".pdf,application/pdf" aria-label="Ijazah" (change)="selectDocument($event, educationDocKey('diploma'))"><small class="field-hint">{{ documentName(educationDocKey('diploma')) || 'PDF, maksimal 2 MB' }}</small></label>
              <label class="file-field">Transkrip nilai <input type="file" accept=".pdf,application/pdf" aria-label="Transkrip" (change)="selectDocument($event, educationDocKey('transcript'))"><small class="field-hint">{{ documentName(educationDocKey('transcript')) || 'PDF, maksimal 2 MB' }}</small></label>
              <label class="field">Proyek atau penghargaan<textarea [(ngModel)]="editEducation.description" [wordLimit]="80" placeholder="Proyek akademik, prestasi, atau penghargaan"></textarea></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'training' && editEducation">
              <label class="field">Jenis<app-choice-field [options]="trainingKindOptions" [allowOther]="false" label="Jenis" [(value)]="editEducation.level"></app-choice-field></label>
              <label class="field">Nama pelatihan<input [(ngModel)]="editEducation.major"></label>
              <label class="field">Penyelenggara<input [(ngModel)]="editEducation.institution"></label>
              <label class="field">Tahun<input type="number" [(ngModel)]="editEducation.startYear"></label>
              <label class="field">Keterangan<textarea [(ngModel)]="editEducation.description" [wordLimit]="80"></textarea></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'certification' && editCert">
              <label class="field">Nama sertifikasi<input [(ngModel)]="editCert.name"></label>
              <label class="field">Nomor sertifikat<input [(ngModel)]="editCert.credentialId"></label>
              <label class="field">Penyelenggara / institusi yang mengeluarkan<input [(ngModel)]="editCert.issuingOrganization"></label>
              <div class="form-grid">
                <label class="field">Masa berlaku: mulai<input type="date" [(ngModel)]="editCert.issueDate"></label>
                <label class="field">Masa berlaku: sampai<input type="date" [(ngModel)]="editCert.expiryDate"></label>
              </div>
              <label class="file-field">Upload sertifikat <input type="file" accept=".pdf,application/pdf" aria-label="Upload sertifikat" (change)="selectDocument($event, certDocKey())"><small class="field-hint">{{ documentName(certDocKey()) || 'PDF, maksimal 2 MB' }}</small></label>
            </div>

            <div class="form-stack" *ngIf="drawerSection === 'additional'">
              <fieldset class="field-group">
                <legend>Ekspektasi gaji per bulan</legend>
                <div class="form-grid">
                  <label class="field">Minimum<input type="number" min="0" step="1" [(ngModel)]="profile.expectedSalary" placeholder="Contoh: 8000000"></label>
                  <label class="field">Maksimum<input type="number" [min]="profile.expectedSalary || 0" step="1" [ngModel]="profile.profileDetails?.expectedSalaryMax" (ngModelChange)="setSalaryMax($event)" placeholder="Contoh: 10000000"></label>
                </div>
              </fieldset>
              <label class="field">Lokasi kerja yang diminati<app-tag-select [options]="options.locations" label="Lokasi" [limit]="3" [(value)]="profile.preferredLocations"></app-tag-select></label>
              <fieldset class="field-group language-edit">
                <legend>Bahasa</legend>
                <label class="check"><input type="checkbox" [ngModel]="profile.profileDetails?.noLanguage" (ngModelChange)="toggleNoLanguage($event)"> Saya tidak memiliki keahlian berbahasa</label>
                <ng-container *ngIf="!profile.profileDetails?.noLanguage">
                  <article class="repeat" *ngFor="let language of languageSkills; let i = index">
                    <div class="repeat-head">
                      <strong>Bahasa {{ i + 1 }}</strong>
                      <button type="button" class="btn btn-ghost btn-sm" *ngIf="languageSkills.length > 1" (click)="removeLanguage(i)"><app-icon name="trash" [size]="16"></app-icon> Hapus</button>
                    </div>
                    <div class="form-grid">
                      <label class="field">Bahasa<app-choice-field [options]="options.languages" label="Bahasa" [(value)]="language.name"></app-choice-field></label>
                      <label class="field">Tingkat penguasaan<app-choice-field [options]="options.proficiency" [allowOther]="false" label="Tingkat" [(value)]="language.proficiency"></app-choice-field></label>
                      <label class="file-field span-2">Sertifikat bahasa <input type="file" accept=".pdf,application/pdf" [attr.aria-label]="'Sertifikat bahasa ' + (i + 1)" (change)="selectDocument($event, languageDocKey(language))"><small class="field-hint">{{ documentName(languageDocKey(language)) || 'PDF, maksimal 2 MB' }}</small></label>
                    </div>
                  </article>
                  <button type="button" class="btn btn-secondary add-row" (click)="addLanguage()"><app-icon name="plus" [size]="16"></app-icon> Tambah bahasa</button>
                </ng-container>
              </fieldset>
              <label class="field">LinkedIn<input [ngModel]="profile.profileDetails?.linkedinUrl || ''" (ngModelChange)="setLinkedInUrl($event)" type="url" placeholder="https://www.linkedin.com/in/…"></label>
              <fieldset class="field-group"><legend>Media sosial</legend><app-social-accounts-field [details]="socialDetails"></app-social-accounts-field></fieldset>
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
  editCert: TrainingCertification | null = null;
  pendingUploads: SupportingUpload[] = [];
  profilePictureFile: File | null = null;
  profilePictureUrl: string | null = null;
  profilePicturePreview: string | null = null;
  saving = false;
  readonly fmt = FMT;
  drawerError = '';
  showAllApplications = false;
  readonly applicationPreview = 2;
  readonly trainingKinds = ['Workshop', 'Webinar', 'Seminar'];
  readonly options = TALENT_OPTIONS;
  readonly tabs = [
    { id: 'about', label: 'Tentang' },
    { id: 'experiences', label: 'Pengalaman' },
    { id: 'education', label: 'Pendidikan' },
    { id: 'training', label: 'Pelatihan' },
    { id: 'certification', label: 'Sertifikasi' },
    { id: 'additional', label: 'Info tambahan' },
  ];
  activeSection = 'about';
  private tabClickedAt = 0;
  private readonly profileSectionIds = ['about', 'experiences', 'education', 'training', 'certification', 'additional'];
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

  /** Tahap tampil satu per satu: hanya sampai tahap yang sudah dicapai lamaran. */
  visibleStages(app: JobApplication) {
    const reached = app.status === 'HIRED' ? this.applicationStages.length : this.applicationStageIndex(app.stage) + 1;
    return this.applicationStages.slice(0, reached);
  }

  canWithdraw(app: JobApplication): boolean {
    return app.status === 'ACTIVE' && app.stage === 'NEW_CANDIDATE';
  }

  get visibleApplications(): JobApplication[] {
    return this.showAllApplications ? this.applications : this.applications.slice(0, this.applicationPreview);
  }

  get trainingKindOptions(): string[] {
    const current = this.editEducation?.level;
    return current && !this.trainingKinds.includes(current) ? [current, ...this.trainingKinds] : this.trainingKinds;
  }

  withdrawApplication(app: JobApplication): void {
    if (!window.confirm(`Tarik lamaran untuk "${app.jobTitle}"?`)) return;

    this.portal.withdraw(app.id).subscribe({
      next: (updated: any) => {
        app.status = updated.status;
        app.stage = updated.stage;
      },
      error: (error) => {
        window.alert(translate(error?.error?.message || 'Lamaran tidak dapat ditarik.'));
      },
    });
  }

  supportingDocumentLabel(key: string): string {
    if (key.startsWith('language:')) {
      const language = this.profile.profileDetails?.languageSkills.find(item => key.includes(item.key));
      return `Sertifikat ${language?.name || 'Bahasa'}`;
    }
    if (key.startsWith('certification:')) {
      const cert = this.profile.profileDetails?.trainingCertifications.find(item => item.key && key.includes(item.key));
      return `Sertifikat ${cert?.name || ''}`.trim();
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
      error: () => window.alert(translate('Dokumen gagal diunduh. Silakan coba lagi.')),
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

  /** Pilihan jenjang; nilai lama yang tidak ada di daftar tetap ditampilkan supaya tidak hilang saat disimpan. */
  get educationLevelOptions(): string[] {
    const current = this.editEducation?.level;
    const levels = this.options.educationLevels;
    return current && !levels.includes(current) ? [current, ...levels] : levels;
  }

  get educationDocuments(): Array<{ key: string; originalName: string }> {
    return (this.profile?.supportingDocuments || []).filter((doc) => !doc.key.startsWith('certification:'));
  }
  get certifications(): TrainingCertification[] { return this.profile?.profileDetails?.trainingCertifications || []; }
  get expDetails() {
    const exp = this.editExperience!;
    return exp.details ||= { employmentType: '', industry: '', skills: [], tools: [], resignReason: '' };
  }

  certificateDocument(item: TrainingCertification): { key: string; originalName: string } | null {
    return (this.profile.supportingDocuments || []).find((doc) => doc.key === `certification:${item.key}:certificate`) || null;
  }

  educationDocKey(kind: 'diploma' | 'transcript'): string { return `education:${this.editEducation?.clientKey}:${kind}`; }
  languageDocKey(language: { key: string }): string { return `language:${language.key}:certificate`; }

  get languageSkills() { return this.ensureDetails().languageSkills ||= []; }

  addLanguage(): void { this.languageSkills.push({ key: crypto.randomUUID(), name: '', proficiency: '' }); }

  removeLanguage(index: number): void {
    const [language] = this.languageSkills.splice(index, 1);
    if (language) this.pendingUploads = this.pendingUploads.filter((u) => !u.key.startsWith(`language:${language.key}:`));
  }

  toggleNoLanguage(checked: boolean): void {
    const details = this.ensureDetails();
    details.noLanguage = checked;
    if (checked) {
      this.pendingUploads = this.pendingUploads.filter((u) => !u.key.startsWith('language:'));
      details.languageSkills = [];
    } else if (!details.languageSkills.length) {
      this.addLanguage();
    }
  }

  certDocKey(): string { return `certification:${this.editCert?.key}:certificate`; }

  documentName(key: string): string {
    return this.pendingUploads.find((u) => u.key === key)?.file.name || this.profile.supportingDocuments?.find((d) => d.key === key)?.originalName || '';
  }

  selectDocument(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) || file.size > 2 * 1024 * 1024) {
      input.value = '';
      this.drawerError = 'File harus berformat PDF dan maksimal 2 MB.';
      return;
    }
    this.drawerError = '';
    this.pendingUploads = [...this.pendingUploads.filter((u) => u.key !== key), { key, file }];
  }

  setSalaryMax(value: number | null): void { this.ensureDetails().expectedSalaryMax = value === null || (value as any) === '' ? null : Number(value); }

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
      header: 'Ubah profil',
      personal: 'Ubah data pribadi',
      interest: 'Ubah minat karier',
      about: 'Tentang saya',
      experience: this.drawerIndex == null ? 'Tambah pengalaman kerja' : 'Ubah pengalaman kerja',
      education: this.drawerIndex == null ? 'Tambah pendidikan' : 'Ubah pendidikan',
      training: this.drawerIndex == null ? 'Tambah pelatihan' : 'Ubah pelatihan',
      certification: this.drawerIndex == null ? 'Tambah sertifikasi' : 'Ubah sertifikasi',
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
    const skills = (this.profile?.profileDetails?.languageSkills || []).filter((item) => item.name);
    if (skills.length) return skills.map((item) => `${item.name} (${item.proficiency.toLowerCase()})`).join(', ');
    if (this.profile?.profileDetails?.noLanguage) return 'Tidak memiliki keahlian berbahasa';
    return this.profile?.languanges || '-';
  }

  openDrawer(section: DrawerSection, index: number | null = null): void {
    this.snapshot = structuredClone(this.profile);
    this.drawerSection = section;
    this.drawerIndex = index;
    this.editExperience = null;
    this.editEducation = null;
    this.editCert = null;
    this.pendingUploads = [];
    this.drawerError = '';

    if (section === 'additional') {
      const details = this.ensureDetails();
      if (!details.noLanguage && !(details.languageSkills || []).length) this.addLanguage();
    }
    if (section === 'certification') {
      const list = this.ensureDetails().trainingCertifications ||= [];
      this.editCert = index == null
        ? { key: crypto.randomUUID(), name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' }
        : structuredClone(list[index]);
      if (!this.editCert.key) this.editCert.key = crypto.randomUUID();
    }
    if (section === 'experience') {
      this.editExperience = index == null
        ? { companyName: '', position: '', startDate: '', endDate: null, currentJob: false, description: '', details: { employmentType: '', industry: '', skills: [], tools: [], resignReason: '' } }
        : structuredClone(this.profile.workExperiences[index]);
      if (this.editExperience) this.editExperience.details ||= { employmentType: '', industry: '', skills: [], tools: [], resignReason: '' };
    }
    if (section === 'education' || section === 'training') {
      const type = section === 'education' ? 'FORMAL' : 'INFORMAL';
      this.editEducation = index == null
        ? { type, clientKey: crypto.randomUUID(), institution: '', level: '', major: '', startYear: null, endYear: null, description: '', ipk: null }
        : structuredClone(this.profile.educations[index]);
      if (this.editEducation && !this.editEducation.clientKey) this.editEducation.clientKey = crypto.randomUUID();
    }
    this.drawerOpen = true;
  }

  private ensureDetails() {
    return this.profile.profileDetails ||= {
      gender: '', postalCode: '', region: '', linkedinUrl: '', socialPlatform: '', socialUsername: '',
      expectedSalaryMax: null, noExperience: false, languageSkills: [], trainingCertifications: [],
    };
  }

  setLinkedInUrl(value: string): void { this.ensureDetails().linkedinUrl = value; }

  setDetail(field: 'gender' | 'region' | 'postalCode' | 'residentialPostalCode' | 'residentialRegion', value: string): void { this.ensureDetails()[field] = value; }

  get socialDetails() { return this.ensureDetails(); }
  get socials(): string[] { return socialList(this.profile?.profileDetails); }

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

  private validateDrawer(): string {
    const p = this.profile;
    const text = (v: unknown) => String(v ?? '').trim();
    const year = (v: unknown) => Number.isInteger(Number(v)) && Number(v) >= 1950 && Number(v) <= new Date().getFullYear() + 10;
    if (this.drawerSection === 'header') {
      if (!text(p.fullName)) return 'Nama lengkap wajib diisi.';
      if (!/^\d{8,15}$/.test(text(p.phone))) return 'Nomor WhatsApp harus 8–15 digit angka.';
    }
    if (this.drawerSection === 'personal') {
      const d = p.profileDetails;
      if (!p.sameAsCitizenIdAddress) {
        if (!text(p.residentialAddress)) return 'Alamat domisili wajib diisi.';
        if (!/^\d{5}$/.test(d?.residentialPostalCode || '') || !text(d?.residentialRegion)) return 'Lengkapi kode pos dan pilihan wilayah domisili.';
      }
    }
    if (this.drawerSection === 'interest' && !p.jobInterests.length) return 'Pilih minimal satu fungsi yang diminati.';
    if (this.drawerSection === 'experience' && this.editExperience) {
      const e = this.editExperience, d = this.expDetails;
      if (!text(e.position) || !text(e.companyName) || !text(d.employmentType) || !text(d.industry) || !text(e.description)) return 'Lengkapi posisi, perusahaan, status, industri, dan tugas.';
      if (!e.startDate || (!e.currentJob && (!e.endDate || e.endDate < e.startDate))) return 'Periksa tanggal kerja. Tanggal selesai tidak boleh sebelum tanggal mulai.';
      if (!d.skills.length || !d.tools.length) return 'Pilih minimal satu keahlian dan satu tools.';
      if (!e.currentJob && !text(d.resignReason)) return 'Alasan berhenti wajib diisi.';
      if (e.currentJob) { e.endDate = null; d.resignReason = ''; }
    }
    if (this.drawerSection === 'education' && this.editEducation) {
      const e = this.editEducation;
      if (!e.level || !text(e.institution) || !text(e.major) || !text(e.ipk)) return 'Jenjang, institusi, jurusan, dan IPK / nilai wajib diisi.';
      if (!Number.isFinite(Number(e.ipk))) return 'IPK / nilai harus berupa angka.';
      if (!year(e.startYear) || !year(e.endYear) || Number(e.endYear) < Number(e.startYear)) return 'Tahun pendidikan harus valid dan tahun selesai tidak boleh sebelum tahun mulai.';
      if (!this.documentName(this.educationDocKey('diploma')) || !this.documentName(this.educationDocKey('transcript'))) return 'Ijazah dan transkrip wajib diunggah (PDF, maks. 2 MB).';
    }
    if (this.drawerSection === 'training' && this.editEducation) {
      const e = this.editEducation;
      if (!this.trainingKinds.includes(e.level || '') || !text(e.major) || !text(e.institution)) return 'Jenis, nama pelatihan, dan penyelenggara wajib diisi.';
      if (!year(e.startYear)) return 'Tahun pelatihan harus valid.';
    }
    if (this.drawerSection === 'certification' && this.editCert) {
      const c = this.editCert;
      if (!text(c.name) || !text(c.issuingOrganization) || !text(c.credentialId) || !c.issueDate || !c.expiryDate) return 'Lengkapi nama, penyelenggara atau institusi penerbit, nomor, dan masa berlaku sertifikasi.';
      if (c.expiryDate < c.issueDate) return 'Masa berlaku sertifikasi: tanggal akhir tidak boleh sebelum tanggal mulai.';
      if (!this.documentName(this.certDocKey())) return 'Upload sertifikat wajib diisi (PDF, maks. 2 MB).';
    }
    if (this.drawerSection === 'additional') {
      const d = this.ensureDetails();
      const min = Number(p.expectedSalary), max = Number(d.expectedSalaryMax);
      if (!(min >= 0) || p.expectedSalary == null || !(max >= min) || d.expectedSalaryMax == null) return 'Isi rentang ekspektasi gaji yang valid. Maksimum harus sama atau lebih besar dari minimum.';
      if (!p.preferredLocations.length) return 'Pilih minimal satu lokasi kerja yang diminati.';
      if (!d.noLanguage) {
        const skills = d.languageSkills || [];
        if (!skills.length || skills.some((l) => !text(l.name) || !l.proficiency)) return 'Bahasa dan tingkat penguasaan wajib diisi, atau centang tidak memiliki keahlian berbahasa.';
        if (skills.some((l) => !this.documentName(this.languageDocKey(l)))) return 'Sertifikat bahasa wajib diunggah untuk setiap bahasa (PDF, maks. 2 MB). Bila tidak memiliki sertifikat, centang tidak memiliki keahlian berbahasa.';
      }
      cleanSocial(d);
      if (!(d.socialPlatform || '').trim() || !(d.socialUsername || '').trim()) return 'Media sosial dan username wajib diisi.';
      return socialError(d);
    }
    return '';
  }

  saveDrawer(): void {
    this.drawerError = this.validateDrawer();
    if (this.drawerError) return;
    if (this.drawerSection === 'experience' && this.editExperience) {
      if (this.drawerIndex == null) this.profile.workExperiences = [...this.profile.workExperiences, this.editExperience];
      else this.profile.workExperiences[this.drawerIndex] = this.editExperience;
    }

    if ((this.drawerSection === 'education' || this.drawerSection === 'training') && this.editEducation) {
      if (this.drawerIndex == null || this.drawerIndex < 0) this.profile.educations = [...this.profile.educations, this.editEducation];
      else this.profile.educations[this.drawerIndex] = this.editEducation;
    }

    if (this.drawerSection === 'certification' && this.editCert) {
      const d = this.ensureDetails();
      const list = [...(d.trainingCertifications || [])];
      if (this.drawerIndex == null) list.push(this.editCert); else list[this.drawerIndex] = this.editCert;
      d.trainingCertifications = list;
      d.noCertification = false;
    }
    if (this.drawerSection === 'training') this.ensureDetails().noTraining = false;
    if (this.drawerSection === 'additional') {
      const d = this.ensureDetails();
      this.profile.languanges = d.noLanguage ? '' : (d.languageSkills || []).map((l) => l.name).join(', ');
    }
    if (this.drawerSection === 'experience') {
      this.ensureDetails().noExperience = false;
      this.syncDerivedFromExperience();
    }

    this.saving = true;
    this.portal.saveProfile(this.profile, this.profilePictureFile, null, [], this.pendingUploads).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.saving = false;
        const photoChanged = !!this.profilePictureFile;
        this.closeDrawer();
        if (photoChanged) this.loadProfilePicture();
      },
      error: (error) => {
        this.saving = false;
        this.drawerError = error?.error?.message || 'Perubahan belum tersimpan. Periksa data Anda, lalu coba lagi.';
      },
    });
  }

  /** Tools, industri, dan posisi minat diturunkan dari pengalaman kerja, sama seperti saat onboarding. */
  private syncDerivedFromExperience(): void {
    const work = this.profile.workExperiences;
    this.profile.tools = Array.from(new Set(work.flatMap((exp) => exp.details?.tools || []))).slice(0, 20);
    this.profile.relatedIndustries = Array.from(new Set(work.map((exp) => exp.details?.industry || '').filter(Boolean))).slice(0, 3);
  }

  private closeDrawer(): void {
    this.editCert = null;
    this.pendingUploads = [];
    this.drawerError = '';
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
