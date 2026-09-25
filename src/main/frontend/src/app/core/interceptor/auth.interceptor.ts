import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.includes('/api/talent/')) {
    return next(request);
  }

  try {
    const raw = sessionStorage.getItem('sarinahCandidateSession');
    const token = raw ? JSON.parse(raw)?.accessToken : null;
    if (token) {
      request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  } catch {
    // Let backend return 401 when the stored session is invalid.
  }

  return next(request);
};
