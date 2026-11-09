import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { BackofficeAuthService } from '../service/api/backoffice-auth.service';

/** Token backoffice berumur pendek: bila server menolaknya (401), kembali ke halaman login. */
export const backofficeSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(BackofficeAuthService);
  const isBackofficeCall = request.url.includes('/api/backoffice/') && !request.url.includes('/api/backoffice/auth/');
  return next(request).pipe(
    catchError((error: unknown) => {
      if (isBackofficeCall && error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
