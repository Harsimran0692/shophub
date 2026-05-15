import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class OtpGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isOtpRequested()) {
      return true;
    }
    sessionStorage.setItem(
      'otpError',
      'Please enter your email first to receive an OTP.'
    );
    this.router.navigate(['/forgot-password']);
    return false;
  }
}
