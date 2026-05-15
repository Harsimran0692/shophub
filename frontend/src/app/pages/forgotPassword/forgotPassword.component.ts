import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './forgotPassword.component.html',
})
export class ForgotPasswordComponent {
  email: string = '';
  forgotPasswordForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
    }
    this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.status === 'success') {
          this.success = response.message;
          setTimeout(() => {
            this.router.navigate(['/forgot-password/otp']);
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
