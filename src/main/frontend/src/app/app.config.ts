import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { I18nService } from './core/i18n/i18n.service';
import { SiteContentService } from './core/service/api/site-content.service';
import { applyManagedOptions } from './shared/talent-options';
import { firstValueFrom, timeout } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      // Bahasa situs diambil sebelum halaman pertama dirender agar tidak berkedip. Gagal/lambat -> Indonesia.
      provide: APP_INITIALIZER,
      multi: true,
      deps: [I18nService, SiteContentService],
      useFactory: (i18n: I18nService, site: SiteContentService) => () =>
        firstValueFrom(site.raw().pipe(timeout(2500))).then((s) => { applyManagedOptions(s?.contents); i18n.apply(s?.language); }, () => i18n.apply('id')),
    },
  ],
};
