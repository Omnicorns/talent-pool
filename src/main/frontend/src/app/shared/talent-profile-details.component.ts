
import { Component, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BackofficeAuthService } from '../core/service/api/backoffice-auth.service';
import { CandidateProfile, TalentProfileDetails } from '../core/models/talent.models';
import { API_BASE } from '../core/service/api/api-base';
import { IconComponent } from './icon.component';
import { salaryRange } from './labels';
import { socialList } from './social-accounts';

@Component({
    selector: 'app-talent-profile-details',
    imports: [IconComponent],
    template: `
  @if (profile.profileDetails; as details) {
    <div class="talent-details">
      <dl class="facts" [class.one]="!backoffice" [class.two]="backoffice">
        <div><dt>Jenis kelamin</dt><dd>{{ details.gender || '-' }}</dd></div>
        <div><dt>Agama</dt><dd>{{ profile.religion || '-' }}</dd></div>
        <div><dt>Alamat KTP</dt><dd>{{ joinParts(profile.citizenIdAddress, details.region, details.postalCode) }}</dd></div>
        <div><dt>Alamat domisili</dt><dd>
        @if (profile.sameAsCitizenIdAddress) {
          {{ joinParts(profile.citizenIdAddress, details.region, details.postalCode) }} <small class="muted">(sama dengan alamat KTP)</small>
        } @else {
          {{ joinParts(profile.residentialAddress, details.residentialRegion, details.residentialPostalCode) }}
        }
      </dd></div>
      <div><dt>Tahu Sarinah dari</dt><dd>{{ profile.source || '-' }}</dd></div>
    </dl>
    @if (showAdditionalInformation) {
      <p class="subhead">Informasi tambahan</p>
      <dl class="facts two">
        <div><dt>Ekspektasi gaji per bulan</dt><dd>{{ salaryRange(profile.expectedSalary, details.expectedSalaryMax) }}</dd></div>
        <div><dt>Fungsi yang diminati</dt><dd>{{ profile.jobInterests.join(', ') || '-' }}</dd></div>
        <div><dt>Lokasi yang diminati</dt><dd>{{ profile.preferredLocations.join(', ') || '-' }}</dd></div>
        <div><dt>Kemampuan bahasa</dt><dd>{{ languages(details) }}</dd></div>
        <div><dt>LinkedIn</dt><dd>{{ details.linkedinUrl || '-' }}</dd></div>
        <div><dt>Media sosial</dt><dd>@for (item of socials(details); track item) {
        <span class="line">{{ item }}</span>
        }@if (!socials(details).length) {
        -
      }</dd></div>
    </dl>
  }
  @if (showEducationInformation) {
    <p class="subhead">Dokumen pendidikan</p>
    @if (profile.supportingDocuments?.length) {
      <div class="doc-list">
        @for (doc of profile.supportingDocuments; track doc) {
          <div class="doc">
            <app-icon name="file"></app-icon>
            <span><strong>{{ label(doc.key) }}</strong><small>{{ doc.originalName }}</small></span>
            <button type="button" class="btn btn-ghost btn-sm" (click)="open(doc.key, doc.originalName, false)" [disabled]="downloading" [attr.aria-label]="'Lihat ' + label(doc.key)"><app-icon name="eye" [size]="16"></app-icon> Lihat</button>
            <button type="button" class="btn btn-ghost btn-sm" (click)="open(doc.key, doc.originalName, true)" [disabled]="downloading" [attr.aria-label]="'Unduh ' + label(doc.key)"><app-icon name="download" [size]="16"></app-icon> Unduh</button>
          </div>
        }
      </div>
    } @else {
      <p class="muted" style="font-size: 14px">Belum ada dokumen pendukung.</p>
    }
  }
  @if (error) {
    <div class="alert alert-error" role="alert" style="margin-top: 12px"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
  }
  </div>
  }
  `
})
export class TalentProfileDetailsComponent {
  @Input({ required: true }) profile!: CandidateProfile;
  @Input() backoffice = false;
  @Input() showAdditionalInformation = true;
  @Input() showEducationInformation = true;
  error = '';
  downloading = false;
  readonly salaryRange = salaryRange;
  readonly socials = socialList;

  constructor(private http: HttpClient, private backofficeAuth: BackofficeAuthService) {}

  joinParts(...parts: Array<string | null | undefined>): string {
    return parts.map((part) => (part || '').trim()).filter(Boolean).join(', ') || '-';
  }

  languages(details: TalentProfileDetails): string {
    const skills = details.languageSkills || [];
    if (skills.length) return skills.map((item) => `${item.name} (${(item.proficiency || '').toLowerCase()})`).join(', ');
    if (details.noLanguage) return 'Tidak memiliki keahlian berbahasa';
    return this.profile.languanges || '-';
  }

  label(key: string): string {
    if (key.startsWith('language:')) {
      const lang = this.profile.profileDetails?.languageSkills.find((l) => key.includes(l.key));
      return 'Sertifikat ' + (lang?.name || 'bahasa');
    }
    if (key.startsWith('certification:')) {
      const cert = this.profile.profileDetails?.trainingCertifications.find((c) => c.key && key.includes(c.key));
      return 'Sertifikat ' + (cert?.name || '');
    }
    if (key.startsWith('project:')) {
      const item = this.profile.profileDetails?.projects?.find((x) => x.key && key.includes(x.key));
      return 'Lampiran proyek ' + (item?.name || '');
    }
    if (key.startsWith('award:')) {
      const item = this.profile.profileDetails?.awards?.find((x) => x.key && key.includes(x.key));
      return 'Bukti penghargaan ' + (item?.name || '');
    }
    const edu = this.profile.educations.find((e) => e.clientKey && key.includes(e.clientKey));
    if (key.endsWith(':certificate')) return 'Sertifikat pelatihan ' + (edu?.major || '');
    return (key.endsWith(':diploma') ? 'Ijazah' : 'Transkrip') + ' ' + (edu?.institution || '');
  }

  open(key: string, name: string, save: boolean): void {
    this.error = '';
    const tab = save ? null : window.open('', '_blank');
    this.downloading = true;
    const url = this.backoffice ? `/backoffice/candidates/${this.profile.id}/documents/` : '/talent/profile/documents/';
    const headers = this.backoffice ? new HttpHeaders({ Authorization: this.backofficeAuth.authorization || '' }) : new HttpHeaders();
    this.http.get(API_BASE + url + encodeURIComponent(key), { responseType: 'blob', headers }).subscribe({
      next: (blob) => {
        this.downloading = false;
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        if (!save && tab) {
          tab.location.href = href;
          setTimeout(() => URL.revokeObjectURL(href), 60000);
          return;
        }
        link.href = href;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      },
      error: () => {
        this.downloading = false;
        tab?.close();
        this.error = 'Dokumen belum bisa dibuka. Coba lagi beberapa saat lagi.';
      },
    });
  }
}
