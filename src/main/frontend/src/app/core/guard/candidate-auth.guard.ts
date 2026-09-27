import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TalentAuthService } from '../service/api/talent-auth.service';

export const candidateAuthGuard: CanActivateFn = () => {
  const auth = inject(TalentAuthService);
  const router = inject(Router);

  if (!auth.authenticated) {
    return router.createUrlTree(['/sign-in']);
  }

  return true;
};

export const completedOnboardingGuard: CanActivateFn = () => {
  const auth = inject(TalentAuthService);
  const router = inject(Router);

  if (!auth.authenticated) {
    return router.createUrlTree(['/sign-in']);
  }

  return auth.session?.onboardingCompleted
    ? true
    : router.createUrlTree(['/onboarding']);
};
