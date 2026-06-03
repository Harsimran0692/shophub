import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPassword,
  ForgotPasswordResponse,
  OtpRequest,
  OtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
} from '.././models/user.interface';
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router';

declare let google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private currentEmail: string | null = null;
  private otpRequested: boolean = false;
  private authStateSubject = new BehaviorSubject<boolean>(false);
  private googleSignInToken: string | null = null;
  authState$ = this.authStateSubject.asObservable();

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      this.clearAuthData();
    }

    try {
      if (typeof user === 'string') {
        const parsedUser = JSON.parse(user);
        if (parsedUser && typeof parsedUser === 'object') {
          this.tokenSubject.next(token);
          this.currentUserSubject.next(parsedUser);
        } else {
          console.error('Invalid user data in localStorage');
          this.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      this.clearAuthData();
    }
  }

  // google login services

  initializeGoogleSignIn(): void {
    if (!google?.accounts?.id) {
      console.error('Google Identity service not Loaded');
      return;
    }
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.getGoogleSignInToken.bind(this),
    });

    const googleBtn = document.getElementById('signin_with');
    if (!googleBtn) {
      console.error('Google button element not found');
      return;
    }
    google.accounts.id.renderButton(googleBtn, {
      theme: 'outline',
      size: 'large',
      width: '400',
      type: 'standard', // Use standard button to avoid personalization
    });
  }

  getGoogleSignInToken(response: any) {
    this.googleSignInToken = response.credential;

    this.googleLogin().subscribe({
      next: (result) => {
        console.log(result); // Notify component of success
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Google login error:', error);
      },
    });
  }

  googleLogin(): Observable<GoogleLoginResponse> {
    if (!this.googleSignInToken) {
      throw new Error('No Google Sign-In token available');
    }
    const credentials: GoogleLoginRequest = {
      idToken: this.googleSignInToken,
    };
    console.log(credentials);
    return this.http
      .post<GoogleLoginResponse>(
        `${this.apiUrl}/users/auth/google`,
        credentials
      )
      .pipe(
        tap((response) => {
          console.log(response);
          this.setAuthData(response.data.token, response.data.user);
        }),
        catchError(this.handleError)
      );
  }

  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/users/login`, credentials)
      .pipe(
        tap((response) => {
          console.log(response);
          this.setAuthData(response.data.token, response.data.user);
        }),
        catchError(this.handleError)
      );
  }

  forgotPassword(
    credentials: ForgotPassword
  ): Observable<ForgotPasswordResponse> {
    return this.http
      .post<ForgotPasswordResponse>(
        `${this.apiUrl}/users/forgot-password`,
        credentials
      )
      .pipe(
        tap((response) => {
          if (response.status === 'success') {
            this.currentEmail = response.data.email;
            this.otpRequested = true;
          }
        })
      );
  }

  verifyOtp(otpData: OtpRequest): Observable<OtpResponse> {
    return this.http
      .post<OtpResponse>(`${this.apiUrl}/users/verify-otp`, otpData)
      .pipe(
        tap((response) => {
          if (response.status === 'success') {
            this.otpRequested = false;
          }
        })
      );
  }
  resetPassword(
    passwordData: ResetPasswordRequest
  ): Observable<ResetPasswordResponse> {
    return this.http
      .put<ResetPasswordResponse>(
        `${this.apiUrl}/users/reset-password`,
        passwordData
      )
      .pipe(
        tap((response) => {
          if (response.status === 'success') {
            this.otpRequested = false;
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/users/register`, userData)
      .pipe(
        tap((response) => {
          this.setAuthData(response.data.token, response.data.user);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    google.accounts.id.disableAutoSelect();
  }

  isOtpRequested(): boolean {
    return this.otpRequested && !!this.currentEmail; // OTP requested and email exists
  }

  getCurrentEmail(): string | null {
    return this.currentEmail;
  }

  clearOtpState(): void {
    this.currentEmail = null;
    this.otpRequested = false;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}).pipe(
      tap((response) => {
        this.setAuthData(response.data.token, response.data.user);
      }),
      catchError(this.handleError)
    );
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
