import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BackofficeAuthService } from '../core/service/api/backoffice-auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CandidateProfile } from '../core/models/talent.models';
import { API_BASE } from '../core/service/api/api-base';
@Component({selector:'app-talent-profile-details',standalone:true,imports:[CommonModule],template:`
  <section class="talent-details" *ngIf="profile.profileDetails as details">
    <h3 class="talent-details-subheading">Data Personal</h3>
    <div class="info-grid">
      <article><span>Agama</span><strong>{{ profile.religion || '-' }}</strong></article>
      <article><span>Jenis Kelamin</span><strong>{{ details.gender || '-' }}</strong></article>
      <article><span>Alamat KTP</span><strong>{{ profile.citizenIdAddress || '-' }}</strong></article>
      <article><span>Wilayah & Kode Pos</span><strong>{{ joinParts(details.region, details.postalCode) }}</strong></article>
      <article><span>Alamat Domisili</span><strong>{{ profile.sameAsCitizenIdAddress ? profile.citizenIdAddress : profile.residentialAddress || '-' }}</strong></article>
      <article><span>Sumber Informasi</span><strong>{{ profile.source || '-' }}</strong></article>
    </div>
    <ng-container *ngIf="showAdditionalInformation">
    <h3 class="talent-details-subheading">Additional Information</h3>
    <div class="info-grid">
      <article><span>LinkedIn</span><strong>{{ details.linkedinUrl || '-' }}</strong></article>
      <article><span>Media Sosial</span><strong>{{ joinParts(details.socialPlatform, details.socialUsername) }}</strong></article>
      <article><span>Ekspektasi Gaji per Bulan</span><strong>{{ salaryRange(profile.expectedSalary, details.expectedSalaryMax) }}</strong></article>
      <article><span>Fungsi yang Diminati</span><strong>{{ profile.jobInterests.join(', ') || '-' }}</strong></article>
      <article><span>Lokasi yang Diminati</span><strong>{{ profile.preferredLocations.join(', ') || '-' }}</strong></article>
    </div>
    <h4>Kemampuan Bahasa</h4>
    <p *ngIf="!details.languageSkills?.length">Belum ada kemampuan bahasa yang ditambahkan.</p>
    <p *ngFor="let language of details.languageSkills">{{ language.name }} • {{ language.proficiency }}</p>
    <h4>Keahlian & Pengalaman</h4>
    <p *ngIf="details.noExperience">Belum memiliki pengalaman kerja.</p>
    <article class="talent-detail-work" *ngFor="let work of profile.workExperiences"><ng-container *ngIf="work.details as data"><strong>{{ work.position }} • {{ work.companyName }}</strong><p>Skill: {{ data.skills.join(', ') || '-' }}</p><p>Tools: {{ data.tools.join(', ') || '-' }}</p></ng-container></article>
    </ng-container>
    <ng-container *ngIf="showEducationInformation">
      <h3 class="talent-details-subheading">Pendidikan</h3>
      <p *ngFor="let education of profile.educations">{{ education.institution }} • {{ education.major }} • IPK / nilai {{ education.ipk || '-' }}</p>
      <p *ngIf="!profile.educations.length">Belum ada data pendidikan.</p>
      <h4>Dokumen Pendukung</h4>
      <div class="talent-document-list"><button type="button" *ngFor="let doc of profile.supportingDocuments" (click)="download(doc.key,doc.originalName)" [disabled]="downloading">{{ label(doc.key) }}: {{ doc.originalName }} ↓</button></div>
      <p *ngIf="!profile.supportingDocuments?.length">Belum ada dokumen pendukung.</p>
    </ng-container>
    <p *ngIf="error" role="alert" class="form-error">{{ error }}</p>
  </section>`})
export class TalentProfileDetailsComponent {
  @Input({required:true}) profile!:CandidateProfile;
  @Input() backoffice=false;
  @Input() showAdditionalInformation=true;
  @Input() showEducationInformation=true;
  error='';downloading=false;
  constructor(private http:HttpClient,private backofficeAuth:BackofficeAuthService) {}
  joinParts(...parts:Array<string|null|undefined>):string {
    return parts.map(part=>(part||'').trim()).filter(Boolean).join(' • ')||'-';
  }
  salaryRange(min:number|null|undefined,max:number|null|undefined):string {
    const rupiah=(value:number)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
    if(min==null&&max==null)return '-';
    if(min!=null&&max!=null&&min!==max)return `${rupiah(min)} – ${rupiah(max)}`;
    return rupiah((min??max) as number);
  }
  label(key:string):string {
    if(key.startsWith('language:')){const lang=this.profile.profileDetails?.languageSkills.find(l=>key.includes(l.key));return 'Sertifikat '+(lang?.name||'Bahasa');}
    const edu=this.profile.educations.find(e=>e.clientKey && key.includes(e.clientKey));return (key.endsWith(':diploma') ? 'Ijazah' : 'Transkrip')+' '+(edu?.institution||'');
  }
  download(key:string,name:string):void {
    this.error='';this.downloading=true;
    const url=this.backoffice ? `/backoffice/candidates/${this.profile.id}/documents/` : '/talent/profile/documents/';
    this.http.get(API_BASE+url+encodeURIComponent(key),{responseType:'blob',headers:this.backoffice ? new HttpHeaders({Authorization:this.backofficeAuth.authorization||''}) : new HttpHeaders()}).subscribe({next:blob=>{
      this.downloading=false;const href=URL.createObjectURL(blob),link=document.createElement('a');link.href=href;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
    },error:()=>{this.downloading=false;this.error='Dokumen gagal diunduh. Silakan coba lagi.';}});
  }
}
