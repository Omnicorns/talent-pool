import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { API_BASE, APP_BASE } from './api-base';
import {
  DEFAULT_CONTENT, DEFAULT_FAQ, DEFAULT_HERO, DEFAULT_HERO_IMAGE, DEFAULT_LIFE_HEADING, DEFAULT_LIFE_IMAGES,
  DEFAULT_LIFE_PROGRAMS, DEFAULT_VALUES,
} from '../../../features/public/site-defaults';

export interface LandingProgram { key: string; title: string; description: string; images: string[]; }
export interface LandingData {
  hero: typeof DEFAULT_HERO;
  heroImages: string[];
  values: typeof DEFAULT_VALUES;
  lifeHeading: typeof DEFAULT_LIFE_HEADING;
  programs: LandingProgram[];
  faqs: typeof DEFAULT_FAQ;
}

/** Konten landing page dari back office. Bagian yang belum diatur memakai isi bawaan. */
@Injectable({ providedIn: 'root' })
export class SiteContentService {
  constructor(private http: HttpClient) {}

  landing(): Observable<LandingData> {
    return this.http.get<{ contents?: Record<string, any>; banners?: any[] }>(`${API_BASE}/public/site`).pipe(
      map((site) => this.merge(site?.contents || {}, site?.banners || [])),
      catchError(() => of(this.merge({}, []))),
    );
  }

  private merge(contents: Record<string, any>, banners: any[]): LandingData {
    const url = (b: any) => APP_BASE + b.imageUrl;
    const list = (key: string, fallback: any[]) => (Array.isArray(contents[key]) && contents[key].length ? contents[key] : fallback);
    const object = (key: string, fallback: any) => (contents[key] && typeof contents[key] === 'object' && !Array.isArray(contents[key]) ? { ...fallback, ...contents[key] } : fallback);
    const heroImages = banners.filter((b) => b.category === 'HERO').map(url);
    const programs = list('LIFE_PROGRAMS', DEFAULT_LIFE_PROGRAMS).map((p: any): LandingProgram => {
      const custom = banners.filter((b) => b.category === 'LIFE' && b.groupKey === p.key).map(url);
      return { key: p.key, title: p.title, description: p.description, images: custom.length ? custom : (DEFAULT_LIFE_IMAGES[p.key] || []) };
    });
    return {
      hero: object('HERO', DEFAULT_CONTENT['HERO']),
      heroImages: heroImages.length ? heroImages : [DEFAULT_HERO_IMAGE],
      values: list('VALUES', DEFAULT_VALUES),
      lifeHeading: object('LIFE_HEADING', DEFAULT_LIFE_HEADING),
      programs,
      faqs: list('FAQ', DEFAULT_FAQ),
    };
  }
}
