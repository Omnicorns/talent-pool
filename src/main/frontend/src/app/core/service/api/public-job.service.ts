import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JobListing } from '../../models/talent.models';

@Injectable({ providedIn: 'root' })
export class PublicJobService {
  constructor(private http: HttpClient) {}

  list() {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100')
      .set('sort', 'updatedAt,desc');

    return this.http.get<{ content: JobListing[] }>('/api/public/job-listings', { params });
  }
}
