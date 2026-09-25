import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JobListing } from '../../models/talent.models';
import { API_BASE } from './api-base';

@Injectable({ providedIn: 'root' })
export class PublicJobService {
  constructor(private http: HttpClient) {}

  list() {
    const params = new HttpParams().set('page', '0').set('size', '100').set('sort', 'updatedAt,desc');
    return this.http.get<{ content: JobListing[] }>(`${API_BASE}/public/job-listings`, { params });
  }
}
