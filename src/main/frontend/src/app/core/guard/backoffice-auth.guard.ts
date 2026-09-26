import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BackofficeAuthService } from '../service/api/backoffice-auth.service';

export const backofficeAuthGuard: CanActivateFn = () => {
  const auth = inject(BackofficeAuthService);
  const router = inject(Router);
  return auth.authorization ? true : router.createUrlTree(['/backoffice/login']);
};
