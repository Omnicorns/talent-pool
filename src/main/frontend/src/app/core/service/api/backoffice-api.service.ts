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

  candidates(q = '') {
    let params = new HttpParams().set('page', '0').set('size', '50').set('sort', 'updatedAt,desc');
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

  interviews() {
    const params = new HttpParams().set('page', '0').set('size', '50').set('sort', 'scheduledAt,asc');
    return this.http.get<any>(`${API_BASE}/backoffice/interviews`, { headers: this.headers, params });
  }

  createInterview(payload: any) {
    return this.http.post<any>(`${API_BASE}/backoffice/interviews`, payload, { headers: this.headers });
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

  jobListings(q = '') {
    let params = new HttpParams().set('page', '0').set('size', '50').set('sort', 'updatedAt,desc');
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

  applications() {
    const params = new HttpParams().set('page', '0').set('size', '100').set('sort', 'updatedAt,desc');
    return this.http.get<any>(`${API_BASE}/backoffice/applications`, { headers: this.headers, params });
  }

  updateApplicationStage(id: string, stage: string, status?: string | null) {
    return this.http.patch<any>(
      `${API_BASE}/backoffice/applications/${id}/stage`,
      { stage, status: status || null, notes: null },
      { headers: this.headers }
    );
  }
}
