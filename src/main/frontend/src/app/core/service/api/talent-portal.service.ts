import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CandidateProfile, JobApplication, JobListing } from '../../models/talent.models';

@Injectable({ providedIn: 'root' })
export class TalentPortalService {
  constructor(private http: HttpClient) {}

  profile() {
    return this.http.get<CandidateProfile>('/api/talent/profile');
  }

  saveProfile(profile: CandidateProfile) {
    const payload = {
      ...profile,
      email: profile.email,
      source: profile.source || 'Talent Portal',
      termsAccepted: profile.termsAccepted !== false,
      portfolioLinks: (profile.portfolios || [])
        .filter((item) => item.url)
        .map((item) => ({ title: item.title, url: item.url })),
    };

    const data = new FormData();
    data.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    return this.http.put<CandidateProfile>('/api/talent/profile', data);
  }

  applications() {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100')
      .set('sort', 'updatedAt,desc');

    return this.http.get<{ content: JobApplication[] }>('/api/talent/applications', { params });
  }

  jobs() {
    const params = new HttpParams().set('page', '0').set('size', '100');
    return this.http.get<{ content: JobListing[] }>('/api/talent/jobs', { params });
  }

  apply(jobId: string) {
    return this.http.post(`/api/talent/jobs/${jobId}/apply`, {
      notes: 'Dilamar melalui Sarinah Career Portal',
    });
  }

  withdraw(applicationId: string) {
    return this.http.patch(`/api/talent/applications/${applicationId}/withdraw`, {});
  }
}
