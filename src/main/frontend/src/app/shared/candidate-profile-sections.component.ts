import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FMT } from './labels';
import { IconComponent } from './icon.component';
import { TalentProfileDetailsComponent } from './talent-profile-details.component';

/** Ringkasan lengkap profil kandidat untuk backoffice (dipakai di menu Kandidat dan review pelamar di Lowongan). */
@Component({
  selector: 'app-candidate-profile-sections',
  standalone: true,
  imports: [CommonModule, IconComponent, TalentProfileDetailsComponent],
  template: `
            <section class="drawer-section" *ngIf="selected.tools?.length">
  <h3>Tools yang dikuasai</h3>
  <div class="chips"><span class="chip" *ngFor="let tool of selected.tools">{{ tool }}</span></div>
</section>

<section class="drawer-section">
  <h3>Kontak</h3>
  <dl class="facts two">
    <div><dt>Email</dt><dd>{{ selected.email || '-' }}</dd></div>
    <div><dt>WhatsApp</dt><dd>{{ selected.phone || '-' }}</dd></div>
    <div><dt>Tanggal lahir</dt><dd>{{ selected.birthDate ? fmt.fullDate(selected.birthDate) : '-' }}</dd></div>
    <div><dt>Ekspektasi gaji</dt><dd>{{ fmt.salaryRange(selected.expectedSalary, selected.profileDetails?.expectedSalaryMax) }}</dd></div>
  </dl>
</section>

<section class="drawer-section" *ngIf="selected.about">
  <h3>Tentang kandidat</h3>
  <p class="about-copy" style="font-size: 14.5px">{{ selected.about }}</p>
</section>

<section class="drawer-section">
  <h3>Pengalaman kerja</h3>
  <article class="detail-item" *ngFor="let exp of selected.workExperiences">
    <strong>{{ exp.position }}, {{ exp.companyName }}</strong>
    <span>{{ fmt.monthYear(exp.startDate) }} – {{ exp.currentJob ? 'sekarang' : fmt.monthYear(exp.endDate) }}</span>
    <p *ngIf="exp.description">{{ exp.description }}</p>
    <div class="chips" style="margin-top: 8px" *ngIf="exp.details?.skills?.length || exp.details?.tools?.length">
      <span class="chip" *ngFor="let skill of (exp.details?.skills || []).concat(exp.details?.tools || [])">{{ skill }}</span>
    </div>
  </article>
  <p class="muted" style="font-size: 14px" *ngIf="!selected.workExperiences?.length">Belum ada pengalaman kerja.</p>
</section>

<section class="drawer-section" *ngIf="selected.profileDetails?.organizations?.length">
  <h3>Pengalaman organisasi</h3>
  <article class="detail-item" *ngFor="let item of selected.profileDetails?.organizations || []">
    <strong>{{ item.name }}</strong>
    <span>{{ item.role }}{{ item.level ? ' · ' + item.level : '' }}{{ item.type ? ' · ' + item.type : '' }} · {{ item.startDate ? fmt.fullDate(item.startDate) : '-' }} – {{ item.currentlyActive ? 'sekarang' : (item.endDate ? fmt.fullDate(item.endDate) : '-') }}</span>
    <p *ngIf="item.description">{{ item.description }}</p>
  </article>
</section>

<section class="drawer-section">
  <h3>Pendidikan dan pelatihan</h3>
  <article class="detail-item" *ngFor="let edu of selected.educations">
    <strong>{{ edu.institution }}</strong>
    <span>{{ edu.level || '-' }}{{ edu.major ? ', ' + edu.major : '' }} · {{ edu.startYear || '-' }}–{{ edu.endYear || '-' }}{{ edu.ipk ? ' · IPK ' + edu.ipk : '' }}</span>
    <p *ngIf="edu.description">{{ edu.description }}</p>
  </article>
  <article class="detail-item" *ngFor="let cert of selected.profileDetails?.trainingCertifications || []">
    <strong>{{ cert.name }}</strong>
    <span>{{ cert.issuingOrganization }} · berlaku sampai {{ fmt.fullDate(cert.expiryDate) }}</span>
  </article>
</section>

<section class="drawer-section" *ngIf="selected.profileDetails?.projects?.length || selected.profileDetails?.awards?.length">
  <h3>My Achievements</h3>
  <article class="detail-item" *ngFor="let item of selected.profileDetails?.projects || []">
    <strong>{{ item.name }}</strong>
    <span>Proyek · {{ item.category }}{{ item.role ? ' · ' + item.role : '' }}{{ item.organization ? ' · ' + item.organization : '' }}</span>
    <p *ngIf="item.description">{{ item.description }}</p>
  </article>
  <article class="detail-item" *ngFor="let item of selected.profileDetails?.awards || []">
    <strong>{{ item.name }}</strong>
    <span>Penghargaan · {{ item.category }} · {{ item.level }}{{ item.institution ? ' · ' + item.institution : '' }}</span>
    <p *ngIf="item.description">{{ item.description }}</p>
  </article>
</section>

<section class="drawer-section">
  <h3>Data pribadi</h3>
  <app-talent-profile-details [profile]="selected" [backoffice]="true"></app-talent-profile-details>
</section>

<section class="drawer-section" *ngIf="selected.portfolios?.length">
  <h3>Portofolio</h3>
  <a class="link" *ngFor="let item of selected.portfolios" [href]="item.url" target="_blank" rel="noreferrer">
    {{ item.title || item.originalName || 'Portofolio' }} <app-icon name="arrow-up-right" [size]="14"></app-icon>
  </a>
</section>
  `,
})
export class CandidateProfileSectionsComponent {
  @Input({ required: true }) selected: any;
  readonly fmt = FMT;
}
