import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        phone: ['', [Validators.pattern(/^\+?[\d\s-]{10,15}$/)]],
        street: ['', [Validators.maxLength(100)]],
        city: ['', [Validators.maxLength(50)]],
        state: ['', [Validators.maxLength(50)]],
        country: ['', [Validators.maxLength(50)]],
        postalCode: ['', [Validators.maxLength(20)]],
        terms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = null;

      const {
        name,
        email,
        password,
        phone,
        street,
        city,
        state,
        country,
        postalCode,
      } = this.registerForm.value;

      const registerData = {
        name,
        email,
        password,
        ...(phone && { phone }),
        ...((street || city || state || country || postalCode) && {
          address: {
            ...(street && { street }),
            ...(city && { city }),
            ...(state && { state }),
            ...(country && { country }),
            ...(postalCode && { postalCode }),
          },
        }),
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.error =
            error.message || 'Registration failed. Please try again.';
        },
      });
    }
  }
}
