import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CandidateProfile, JobApplication, JobListing } from '../../models/talent.models';
import { API_BASE } from './api-base';

@Injectable({ providedIn: 'root' })
export class TalentPortalService {
  constructor(private http: HttpClient) {}

  profile() {
    return this.http.get<CandidateProfile>(`${API_BASE}/talent/profile`);
  }

  profilePicture() {
    return this.http.get(`${API_BASE}/talent/profile/picture`, {
      responseType: 'blob',
    });
  }

  saveProfile(profile: CandidateProfile, profilePicture?: File | null) {
    const payload = {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      birthDate: profile.birthDate || null,
      identityNumber: profile.identityNumber || null,
      about: profile.about || null,
      citizenIdAddress: profile.citizenIdAddress || null,
      residentialAddress: profile.sameAsCitizenIdAddress
        ? (profile.citizenIdAddress || null)
        : (profile.residentialAddress || null),
      languanges: profile.languanges || null,
      religion: profile.religion || null,
      sameAsCitizenIdAddress: !!profile.sameAsCitizenIdAddress,
      currentSalary: profile.currentSalary ?? null,
      expectedSalary: profile.expectedSalary ?? null,
      source: profile.source || 'Talent Portal',
      termsAccepted: profile.termsAccepted !== false,
      relatedIndustries: profile.relatedIndustries || [],
      relatedJobPositions: profile.relatedJobPositions || [],
      tools: profile.tools || [],
      jobInterests: profile.jobInterests || [],
      preferredLocations: profile.preferredLocations || [],
      educations: profile.educations || [],
      workExperiences: profile.workExperiences || [],
      portfolioLinks: (profile.portfolios || [])
        .filter((item) => item.type === 'LINK' && item.url)
        .map((item) => ({ title: item.title, url: item.url })),
    };

    const data = new FormData();
    data.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }

    return this.http.put<CandidateProfile>(`${API_BASE}/talent/profile`, data);
  }

  applications() {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100')
      .set('sort', 'updatedAt,desc');

    return this.http.get<{ content: JobApplication[] }>(
      `${API_BASE}/talent/applications`,
      { params }
    );
  }

  jobs() {
    const params = new HttpParams().set('page', '0').set('size', '100');
    return this.http.get<{ content: JobListing[] }>(
      `${API_BASE}/talent/jobs`,
      { params }
    );
  }

  apply(jobId: string) {
    return this.http.post(`${API_BASE}/talent/jobs/${jobId}/apply`, {
      notes: 'Dilamar melalui Sarinah Career Portal',
    });
  }

  withdraw(applicationId: string) {
    return this.http.patch(
      `${API_BASE}/talent/applications/${applicationId}/withdraw`,
      {}
    );
  }
}
