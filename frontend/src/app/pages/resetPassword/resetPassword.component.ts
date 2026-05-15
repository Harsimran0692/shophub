import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationExtras } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../../models/user.interface';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './resetPassword.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  email: string | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.email = this.authService.getCurrentEmail();
    const navigation = this.router.getCurrentNavigation();
    if (!this.email) {
      this.error =
        'Invalid or expired session. Please start the process again.';
      this.router.navigate(['/forgot-password']);
    }
  }

  passwordMatchValidator(form: FormGroup): { mismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.email) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const resetData: ResetPasswordRequest = {
      email: this.email,
      password: this.resetPasswordForm.value.password,
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (response: ResetPasswordResponse) => {
        this.loading = false;
        if (response.status === 'success') {
          this.success = response.message;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.loading = false;
        this.error =
          error?.error?.message ||
          'An unexpected error occurred. Please try again later.';
      },
    });
  }
}
