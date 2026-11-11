
import { Component, Input } from '@angular/core';
import { FMT } from './labels';
import { IconComponent } from './icon.component';
import { TalentProfileDetailsComponent } from './talent-profile-details.component';

/** Ringkasan lengkap profil kandidat untuk backoffice (dipakai di menu Kandidat dan review pelamar di Lowongan). */
@Component({
    selector: 'app-candidate-profile-sections',
    imports: [IconComponent, TalentProfileDetailsComponent],
    template: `
            @if (selected.tools?.length) {
              <section class="drawer-section">
                <h3>Tools yang dikuasai</h3>
                <div class="chips">@for (tool of selected.tools; track tool) {
                  <span class="chip">{{ tool }}</span>
                }</div>
              </section>
            }
            
            <section class="drawer-section">
              <h3>Kontak</h3>
              <dl class="facts two">
                <div><dt>Email</dt><dd>{{ selected.email || '-' }}</dd></div>
                <div><dt>WhatsApp</dt><dd>{{ selected.phone || '-' }}</dd></div>
                <div><dt>Tanggal lahir</dt><dd>{{ selected.birthDate ? fmt.fullDate(selected.birthDate) : '-' }}</dd></div>
                <div><dt>Ekspektasi gaji</dt><dd>{{ fmt.salaryRange(selected.expectedSalary, selected.profileDetails?.expectedSalaryMax) }}</dd></div>
              </dl>
            </section>
            
            @if (selected.about) {
              <section class="drawer-section">
                <h3>Tentang kandidat</h3>
                <p class="about-copy" style="font-size: 14.5px">{{ selected.about }}</p>
              </section>
            }
            
            <section class="drawer-section">
              <h3>Pengalaman kerja</h3>
              @for (exp of selected.workExperiences; track exp) {
                <article class="detail-item">
                  <strong>{{ exp.position }}, {{ exp.companyName }}</strong>
                  <span>{{ fmt.monthYear(exp.startDate) }} – {{ exp.currentJob ? 'sekarang' : fmt.monthYear(exp.endDate) }}</span>
                  @if (exp.description) {
                    <p>{{ exp.description }}</p>
                  }
                  @if (exp.details?.skills?.length || exp.details?.tools?.length) {
                    <div class="chips" style="margin-top: 8px">
                      @for (skill of (exp.details?.skills || []).concat(exp.details?.tools || []); track skill) {
                        <span class="chip">{{ skill }}</span>
                      }
                    </div>
                  }
                </article>
              }
              @if (!selected.workExperiences?.length) {
                <p class="muted" style="font-size: 14px">Belum ada pengalaman kerja.</p>
              }
            </section>
            
            @if (selected.profileDetails?.organizations?.length) {
              <section class="drawer-section">
                <h3>Pengalaman organisasi</h3>
                @for (item of selected.profileDetails?.organizations || []; track item) {
                  <article class="detail-item">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.role }}{{ item.level ? ' · ' + item.level : '' }}{{ item.type ? ' · ' + item.type : '' }} · {{ item.startDate ? fmt.fullDate(item.startDate) : '-' }} – {{ item.currentlyActive ? 'sekarang' : (item.endDate ? fmt.fullDate(item.endDate) : '-') }}</span>
                    @if (item.description) {
                      <p>{{ item.description }}</p>
                    }
                  </article>
                }
              </section>
            }
            
            <section class="drawer-section">
              <h3>Pendidikan dan pelatihan</h3>
              @for (edu of selected.educations; track edu) {
                <article class="detail-item">
                  <strong>{{ edu.institution }}</strong>
                  <span>{{ edu.level || '-' }}{{ edu.major ? ', ' + edu.major : '' }} · {{ edu.startYear || '-' }}–{{ edu.endYear || '-' }}{{ edu.ipk ? ' · IPK ' + edu.ipk : '' }}</span>
                  @if (edu.description) {
                    <p>{{ edu.description }}</p>
                  }
                </article>
              }
              @for (cert of selected.profileDetails?.trainingCertifications || []; track cert) {
                <article class="detail-item">
                  <strong>{{ cert.name }}</strong>
                  <span>{{ cert.issuingOrganization }} · berlaku sampai {{ fmt.fullDate(cert.expiryDate) }}</span>
                </article>
              }
            </section>
            
            @if (selected.profileDetails?.projects?.length || selected.profileDetails?.awards?.length) {
              <section class="drawer-section">
                <h3>My Achievements</h3>
                @for (item of selected.profileDetails?.projects || []; track item) {
                  <article class="detail-item">
                    <strong>{{ item.name }}</strong>
                    <span>Proyek · {{ item.category }}{{ item.role ? ' · ' + item.role : '' }}{{ item.organization ? ' · ' + item.organization : '' }}</span>
                    @if (item.description) {
                      <p>{{ item.description }}</p>
                    }
                  </article>
                }
                @for (item of selected.profileDetails?.awards || []; track item) {
                  <article class="detail-item">
                    <strong>{{ item.name }}</strong>
                    <span>Penghargaan · {{ item.category }} · {{ item.level }}{{ item.institution ? ' · ' + item.institution : '' }}</span>
                    @if (item.description) {
                      <p>{{ item.description }}</p>
                    }
                  </article>
                }
              </section>
            }
            
            <section class="drawer-section">
              <h3>Data pribadi</h3>
              <app-talent-profile-details [profile]="selected" [backoffice]="true"></app-talent-profile-details>
            </section>
            
            @if (selected.portfolios?.length) {
              <section class="drawer-section">
                <h3>Portofolio</h3>
                @for (item of selected.portfolios; track item) {
                  <a class="link" [href]="item.url" target="_blank" rel="noreferrer">
                    {{ item.title || item.originalName || 'Portofolio' }} <app-icon name="arrow-up-right" [size]="14"></app-icon>
                  </a>
                }
              </section>
            }
            `
})
export class CandidateProfileSectionsComponent {
  @Input({ required: true }) selected: any;
  readonly fmt = FMT;
}
