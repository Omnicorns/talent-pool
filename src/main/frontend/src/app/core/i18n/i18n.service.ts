import { Injectable, NgZone } from '@angular/core';
import { SiteLanguage, setDictionary, startTranslator, translate } from './translator';
import { EN } from './en';
import { setLocale } from '../../shared/labels';

/** Bahasa tampilan situs kandidat yang diatur dari back office. */
@Injectable({ providedIn: 'root' })
export class I18nService {
  language: SiteLanguage = 'id';

  constructor(private zone: NgZone) {}

  /** Dipanggil sekali saat aplikasi mulai, sebelum halaman pertama dirender. */
  apply(language: string | null | undefined): void {
    this.language = language === 'en' ? 'en' : 'id';
    setLocale(this.language);
    setDictionary(EN);
    // Di luar zona Angular agar perubahan DOM dari penerjemah tidak memicu change detection berulang.
    this.zone.runOutsideAngular(() => startTranslator(this.language));
  }

  /** Untuk teks yang dibuat di kode (mis. window.alert). */
  t(text: string): string {
    return translate(text);
  }
}
