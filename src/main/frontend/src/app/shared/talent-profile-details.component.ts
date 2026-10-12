import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BackofficeAuthService } from '../core/service/api/backoffice-auth.service';
import { CandidateProfile, TalentProfileDetails } from '../core/models/talent.models';
import { API_BASE } from '../core/service/api/api-base';
import { IconComponent } from './icon.component';
import { salaryRange } from './labels';

@Component({
  selector: 'app-talent-profile-details',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
  <div class="talent-details" *ngIf="profile.profileDetails as details">
    <dl class="facts" [class.one]="!backoffice" [class.two]="backoffice">
      <div><dt>Jenis kelamin</dt><dd>{{ details.gender || '-' }}</dd></div>
      <div><dt>Agama</dt><dd>{{ profile.religion || '-' }}</dd></div>
      <div><dt>Alamat KTP</dt><dd>{{ profile.citizenIdAddress || '-' }}</dd></div>
      <div><dt>Wilayah dan kode pos</dt><dd>{{ joinParts(details.region, details.postalCode) }}</dd></div>
      <div><dt>Alamat domisili</dt><dd>{{ profile.sameAsCitizenIdAddress ? 'Sama dengan alamat KTP' : (profile.residentialAddress || '-') }}</dd></div>
      <div><dt>Tahu Sarinah dari</dt><dd>{{ profile.source || '-' }}</dd></div>
    </dl>

    <ng-container *ngIf="showAdditionalInformation">
      <p class="subhead">Informasi tambahan</p>
      <dl class="facts two">
        <div><dt>Ekspektasi gaji per bulan</dt><dd>{{ salaryRange(profile.expectedSalary, details.expectedSalaryMax) }}</dd></div>
        <div><dt>Fungsi yang diminati</dt><dd>{{ profile.jobInterests.join(', ') || '-' }}</dd></div>
        <div><dt>Lokasi yang diminati</dt><dd>{{ profile.preferredLocations.join(', ') || '-' }}</dd></div>
        <div><dt>Kemampuan bahasa</dt><dd>{{ languages(details) }}</dd></div>
        <div><dt>LinkedIn</dt><dd>{{ details.linkedinUrl || '-' }}</dd></div>
        <div><dt>Media sosial</dt><dd>{{ joinParts(details.socialPlatform, details.socialUsername) }}</dd></div>
      </dl>
    </ng-container>

    <ng-container *ngIf="showEducationInformation">
      <p class="subhead">Dokumen pendidikan</p>
      <div class="doc-list" *ngIf="profile.supportingDocuments?.length; else noDocs">
        <button type="button" class="doc" *ngFor="let doc of profile.supportingDocuments" (click)="download(doc.key, doc.originalName)" [disabled]="downloading">
          <app-icon name="file"></app-icon>
          <span><strong>{{ label(doc.key) }}</strong><small>{{ doc.originalName }}</small></span>
          <app-icon name="download" [size]="16"></app-icon>
        </button>
      </div>
      <ng-template #noDocs><p class="muted" style="font-size: 14px">Belum ada dokumen pendukung.</p></ng-template>
    </ng-container>

    <div class="alert alert-error" *ngIf="error" role="alert" style="margin-top: 12px"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
  </div>
  `,
})
export class TalentProfileDetailsComponent {
  @Input({ required: true }) profile!: CandidateProfile;
  @Input() backoffice = false;
  @Input() showAdditionalInformation = true;
  @Input() showEducationInformation = true;
  error = '';
  downloading = false;
  readonly salaryRange = salaryRange;

  constructor(private http: HttpClient, private backofficeAuth: BackofficeAuthService) {}

  joinParts(...parts: Array<string | null | undefined>): string {
    return parts.map((part) => (part || '').trim()).filter(Boolean).join(', ') || '-';
  }

  languages(details: TalentProfileDetails): string {
    const skills = details.languageSkills || [];
    if (skills.length) return skills.map((item) => `${item.name} (${(item.proficiency || '').toLowerCase()})`).join(', ');
    return this.profile.languanges || '-';
  }

  label(key: string): string {
    if (key.startsWith('language:')) {
      const lang = this.profile.profileDetails?.languageSkills.find((l) => key.includes(l.key));
      return 'Sertifikat ' + (lang?.name || 'bahasa');
    }
    const edu = this.profile.educations.find((e) => e.clientKey && key.includes(e.clientKey));
    return (key.endsWith(':diploma') ? 'Ijazah' : 'Transkrip') + ' ' + (edu?.institution || '');
  }

  download(key: string, name: string): void {
    this.error = '';
    this.downloading = true;
    const url = this.backoffice ? `/backoffice/candidates/${this.profile.id}/documents/` : '/talent/profile/documents/';
    const headers = this.backoffice ? new HttpHeaders({ Authorization: this.backofficeAuth.authorization || '' }) : new HttpHeaders();
    this.http.get(API_BASE + url + encodeURIComponent(key), { responseType: 'blob', headers }).subscribe({
      next: (blob) => {
        this.downloading = false;
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      },
      error: () => {
        this.downloading = false;
        this.error = 'Dokumen belum bisa diunduh. Coba lagi beberapa saat lagi.';
      },
    });
  }
}
