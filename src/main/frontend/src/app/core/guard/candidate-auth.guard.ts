import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TalentAuthService } from '../service/api/talent-auth.service';

export const candidateAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(TalentAuthService);
  const router = inject(Router);

  if (!auth.authenticated) {
    return router.createUrlTree(['/sign-in'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return true;
};

export const completedOnboardingGuard: CanActivateFn = (_route, state) => {
  const auth = inject(TalentAuthService);
  const router = inject(Router);

  if (!auth.authenticated) {
    return router.createUrlTree(['/sign-in'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return auth.session?.onboardingCompleted !== false
    ? true
    : router.createUrlTree(['/onboarding'], {
        queryParams: { returnUrl: state.url },
      });
};
