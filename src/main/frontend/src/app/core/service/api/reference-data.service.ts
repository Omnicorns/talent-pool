import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, catchError, map } from 'rxjs';

/** Daftar acuan statis: perguruan tinggi (PDDikti) dan program studi. Dimuat sekali, saat pertama dibutuhkan. */
@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private campuses$?: Observable<string[]>;
  private majors$?: Observable<{ all: string[]; top: string[] }>;

  constructor(private http: HttpClient) {}

  campuses(): Observable<string[]> {
    return this.campuses$ ||= this.http.get<string[]>('data/kampus.json').pipe(catchError(() => of([] as string[])), shareReplay(1));
  }

  majors(): Observable<string[]> {
    return this.majorData().pipe(map((d) => d.all));
  }

  topMajors(): Observable<string[]> {
    return this.majorData().pipe(map((d) => d.top));
  }

  private majorData() {
    return this.majors$ ||= this.http.get<{ all: string[]; top: string[] }>('data/prodi.json').pipe(catchError(() => of({ all: [], top: [] })), shareReplay(1));
  }
}
