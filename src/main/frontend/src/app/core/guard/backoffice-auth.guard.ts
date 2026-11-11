import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BackofficeAuthService } from '../service/api/backoffice-auth.service';

/** Halaman kerja back office (admin/recruiter). Akun pimpinan diarahkan ke halaman ringkasan. */
export const backofficeAuthGuard: CanActivateFn = () => {
  const auth = inject(BackofficeAuthService);
  const router = inject(Router);
  if (!auth.authorization) return router.createUrlTree(['/backoffice/login']);
  return auth.isViewer ? router.createUrlTree(['/backoffice/ringkasan']) : true;
};

/** Halaman ringkasan: boleh dibuka semua peran back office yang sudah login. */
export const backofficeSummaryGuard: CanActivateFn = () => {
  const auth = inject(BackofficeAuthService);
  const router = inject(Router);
  return auth.authorization ? true : router.createUrlTree(['/backoffice/login']);
};
