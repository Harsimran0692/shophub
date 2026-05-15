import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'profile';
  updatingProfile = false;
  changingPassword = false;
  showChangePassword = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.showChangePassword = user.authMethod === 'manual';
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
        });
      } else {
        this.showChangePassword = false; // Ensure disabled if no user
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  getInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.updatingProfile = true;

      // Simulate API call
      setTimeout(() => {
        this.updatingProfile = false;
      }, 2000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.changingPassword = true;

      // Simulate API call
      setTimeout(() => {
        this.changingPassword = false;
        this.passwordForm.reset();
      }, 2000);
    }
  }
}
