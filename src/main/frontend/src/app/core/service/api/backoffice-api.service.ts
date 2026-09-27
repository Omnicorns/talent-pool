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

  updateCandidateStatus(id: string, status: string) {
    return this.http.patch<any>(`${API_BASE}/backoffice/candidates/${id}/status`, { status }, { headers: this.headers });
  }

  jobListings(q = '') {
    let params = new HttpParams().set('page', '0').set('size', '50').set('sort', 'updatedAt,desc');
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<any>(`${API_BASE}/backoffice/job-listings`, { headers: this.headers, params });
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
