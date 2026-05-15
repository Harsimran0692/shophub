import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
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
  ForgotPasswordResponse,
  OtpRequest,
  OtpResponse,
} from '../../models/user.interface';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './otp.component.html',
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup;
  loading = false;
  resendLoading = false;
  error: string | null = null;
  success: string | null = null;
  email: string | null = null;
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit6: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    });
  }

  ngOnInit(): void {
    this.email = this.authService.getCurrentEmail();
    if (!this.email) {
      this.error = 'No email provided. Please start the process again.';
      this.router.navigate(['/forgot-password']);
    }
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && index < 6) {
      const nextInput = this.otpInputs.toArray()[index]?.nativeElement;
      nextInput?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1]?.nativeElement;
      prevInput?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text')?.trim();
    if (pastedData && /^[0-9]{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      this.otpForm.patchValue({
        digit1: digits[0],
        digit2: digits[1],
        digit3: digits[2],
        digit4: digits[3],
        digit5: digits[4],
        digit6: digits[5],
      });
      this.otpInputs.last?.nativeElement.focus();
    }
  }

  onSubmit(): void {
    if (this.otpForm.invalid || !this.email) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const otp = Object.values(this.otpForm.value).join('');
    const otpData: OtpRequest = { email: this.email, otp };

    this.authService.verifyOtp(otpData).subscribe({
      next: (response: OtpResponse) => {
        this.loading = false;
        if (response.status === 'success') {
          this.success = response.message;
          this.router.navigate(['/reset-password']);
          // setTimeout(() => {
          //   this.router.navigate(['/reset-password']);
          // }, 2000);
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

  resendOtp(): void {
    if (!this.email) return;

    this.resendLoading = true;
    this.error = null;
    this.success = null;

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (response: ForgotPasswordResponse) => {
        this.resendLoading = false;
        if (response.status === 'success') {
          this.success = 'A new OTP has been sent to your email.';
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.resendLoading = false;
        this.error =
          error?.error?.message ||
          'Failed to resend OTP. Please try again later.';
      },
    });
  }
}
