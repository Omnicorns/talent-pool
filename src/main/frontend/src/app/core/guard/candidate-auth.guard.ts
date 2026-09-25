import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TalentAuthService } from '../service/api/talent-auth.service';

export const candidateAuthGuard: CanActivateFn = () => {
  const auth = inject(TalentAuthService);
  const router = inject(Router);

  return auth.authenticated ? true : router.createUrlTree(['/sign-in']);
};
