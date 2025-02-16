import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TokenStorageService } from '../services/token-storage.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthHTTPService } from './auth-http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private excludedUrls = [
    `${environment.apiUrl}/auth/login`,
    // `${environment.apiUrl}/auth/register`,
    // `${environment.apiUrl}/auth/renew`,
  ]; // List of endpoints that should NOT include the token

  constructor(
    private tokenStorageService: TokenStorageService,
    private authHttpService: AuthHTTPService, // Call API directly to refresh token
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Check if the request URL is excluded from authentication
    if (this.excludedUrls.some((url) => req.url.includes(url))) {
      return next.handle(req); // Skip adding the token
    }

    const auth = this.tokenStorageService.getAuthFromLocalStorage();
    if (auth) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${auth?.authToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Token expired or invalid, attempt refresh
          return this.refreshToken().pipe(
            switchMap((newAuth) => {
              if (!newAuth?.authToken) {
                this.logoutAndRedirect(); // If refresh fails, logout
                return throwError(() => new Error('Session expired'));
              }

              // Save new token and retry the failed request
              this.tokenStorageService.setAuthFromLocalStorage(newAuth);
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAuth.authToken}`,
                },
              });

              return next.handle(retryReq);
            }),
            catchError(() => {
              this.logoutAndRedirect();
              return throwError(
                () => new Error('Session expired, please log in again.')
              );
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  private refreshToken(): Observable<any> {
    const auth = this.tokenStorageService.getAuthFromLocalStorage();
    if (!auth || !auth.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.authHttpService
      .refreshToken(auth.refreshToken)
      .pipe(
        catchError(() => throwError(() => new Error('Failed to refresh token')))
      );
  }

  private logoutAndRedirect() {
    this.tokenStorageService.removeToken();
    this.router.navigate(['/auth/login']);
  }
}
