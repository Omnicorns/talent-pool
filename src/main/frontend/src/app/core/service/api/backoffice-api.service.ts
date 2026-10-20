import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { API_BASE } from './api-base';
import { BackofficeAuthService } from './backoffice-auth.service';

@Injectable({ providedIn: 'root' })
export class BackofficeApiService {
  constructor(private http: HttpClient, private auth: BackofficeAuthService) {}

  private get headers(): HttpHeaders {
    const authorization = this.auth.authorization;
    return new HttpHeaders(authorization ? { Authorization: authorization } : {});
  }

  dashboard() {
    return this.http.get<any>(`${API_BASE}/backoffice/dashboard`, { headers: this.headers });
  }

  candidates(q = '', page = 0, size = 50) {
    let params = new HttpParams().set('page', String(page)).set('size', String(size)).set('sort', 'updatedAt,desc');
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<any>(`${API_BASE}/backoffice/candidates`, { headers: this.headers, params });
  }

  candidateDetail(id: string) {
    return this.http.get<any>(`${API_BASE}/backoffice/candidates/${id}`, { headers: this.headers });
  }

  candidateCv(id: string) {
    return this.http.get(`${API_BASE}/backoffice/candidates/${id}/cv`, {
      headers: this.headers,
      responseType: 'blob',
      observe: 'response',
    });
  }

  updateCandidateReview(id: string, reviewed: boolean) {
    return this.http.patch<any>(`${API_BASE}/backoffice/candidates/${id}/review`, { reviewed }, { headers: this.headers });
  }

  updateApplicationPotential(id: string, potential: boolean) {
    return this.http.patch<any>(`${API_BASE}/backoffice/applications/${id}/potential`, { potential }, { headers: this.headers });
  }

  /** Buka CV di tab baru (PDF tampil langsung di browser). */
  viewCv(id: string): void {
    const tab = window.open('', '_blank');
    this.candidateCv(id).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob || !tab) { tab?.close(); return; }
        const type = blob.type || 'application/pdf';
        tab.location.href = URL.createObjectURL(new Blob([blob], { type }));
      },
      error: () => tab?.close(),
    });
  }

  downloadCv(id: string, fallbackName = 'cv-kandidat'): void {
    this.candidateCv(id).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fallbackName;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
    });
  }

  candidatePicture(id: string) {
    return this.http.get(`${API_BASE}/backoffice/candidates/${id}/picture`, {
      headers: this.headers,
      responseType: 'blob',
    });
  }

  moveCandidateToJobListing(id: string, jobListingId: string, hiringStage: string) {
    return this.http.post<any>(`${API_BASE}/backoffice/candidates/${id}/move-to-job-listing`, {
      jobListingId,
      hiringStage,
    }, { headers: this.headers });
  }

  interviews() {
    const params = new HttpParams().set('page', '0').set('size', '500').set('sort', 'scheduledAt,asc');
    return this.http.get<any>(`${API_BASE}/backoffice/interviews`, { headers: this.headers, params });
  }

  createInterview(payload: any) {
    return this.http.post<any>(`${API_BASE}/backoffice/interviews`, payload, { headers: this.headers });
  }

  updateInterview(id: string, payload: any) {
    return this.http.put<any>(`${API_BASE}/backoffice/interviews/${id}`, payload, { headers: this.headers });
  }

  deleteInterview(id: string) {
    return this.http.delete<void>(`${API_BASE}/backoffice/interviews/${id}`, { headers: this.headers });
  }

  updateInterviewStatus(id: string, status: string, result?: string | null, feedback?: string | null) {
    return this.http.patch<any>(
      `${API_BASE}/backoffice/interviews/${id}/status`,
      { status, result: result || null, feedback: feedback || null },
      { headers: this.headers }
    );
  }

  updateCandidateStatus(id: string, status: string) {
    return this.http.patch<any>(`${API_BASE}/backoffice/candidates/${id}/status`, { status }, { headers: this.headers });
  }

  jobListings(q = '', page = 0, size = 50) {
    let params = new HttpParams().set('page', String(page)).set('size', String(size)).set('sort', 'updatedAt,desc');
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<any>(`${API_BASE}/backoffice/job-listings`, { headers: this.headers, params });
  }

  createJobListing(payload: any) {
    return this.http.post<any>(`${API_BASE}/backoffice/job-listings`, payload, { headers: this.headers });
  }

  updateJobListing(id: string, payload: any) {
    return this.http.put<any>(`${API_BASE}/backoffice/job-listings/${id}`, payload, { headers: this.headers });
  }

  updateJobListingStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'CLOSED') {
    return this.http.patch<any>(
      `${API_BASE}/backoffice/job-listings/${id}/status`,
      { status },
      { headers: this.headers }
    );
  }

  deleteJobListing(id: string) {
    return this.http.delete<void>(`${API_BASE}/backoffice/job-listings/${id}`, { headers: this.headers });
  }

  jobApplications(jobId: string) {
    const params = new HttpParams().set('page', '0').set('size', '200').set('sort', 'updatedAt,desc');
    return this.http.get<any>(`${API_BASE}/backoffice/job-listings/${jobId}/applications`, { headers: this.headers, params });
  }

  applications(page = 0, size = 10, stage = '') {
    let params = new HttpParams().set('page', String(page)).set('size', String(size)).set('sort', 'updatedAt,desc');
    if (stage) params = params.set('stage', stage);
    return this.http.get<any>(`${API_BASE}/backoffice/applications`, { headers: this.headers, params });
  }

  applicationStageCounts() {
    return this.http.get<Record<string, number>>(`${API_BASE}/backoffice/applications/stage-counts`, { headers: this.headers });
  }

  updateApplicationStage(id: string, stage: string, status?: string | null) {
    return this.http.patch<any>(
      `${API_BASE}/backoffice/applications/${id}/stage`,
      { stage, status: status || null, notes: null },
      { headers: this.headers }
    );
  }
}
