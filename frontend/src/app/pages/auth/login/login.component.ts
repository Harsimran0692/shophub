import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
// import { GoogleIdentityService } from '../../../services/google-identity.service';
import { GoogleUser } from '../../../models/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  returnUrl: string = '/';
  user: GoogleUser | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    // private googleIdentityService: GoogleIdentityService,
    private ngZone: NgZone,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loadGoogleScript('https://accounts.google.com/gsi/client');
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // this.googleIdentityService
    //   .initialize()
    //   .then(() => {
    //     this.googleIdentityService.initializeSignIn(environment.googleClientId);
    //     this.googleIdentityService.user$.subscribe((user) => {
    //       this.user = user;
    //       if (user && !this.error) {
    //         this.router.navigate([this.returnUrl]);
    //       }
    //     });
    //     this.googleIdentityService.error$.subscribe((error) => {
    //       this.error = error;
    //     });
    //   })
    //   .catch((error) => {
    //     this.error = error.message;
    //   });
  }

  private loadGoogleScript(googleScript: string): void {
    const script = document.createElement('script');
    script.src = googleScript;
    script.async = true;
    script.defer = true;
    script.onload = () => this.authService.initializeGoogleSignIn();
    script.onerror = () =>
      console.error('Failed to load Google Identity Services script');
    document.head.appendChild(script);
  }

  // initializeGoogleSignIn(): void {
  //   console.log('one');
  //   // Update GoogleIdentityService to accept a callback for handling the response
  //   this.googleIdentityService.googleSignIn((response: any) => {
  //     // console.log('one');
  //     console.log(response);
  //     if (response.credential) {
  //       this.http
  //         .post('http://localhost:3000/api/users/auth/google', {
  //           idToken: response.credential,
  //         })
  //         .subscribe({
  //           next: (res: any) => {
  //             console.log('Signed in:', res);
  //             localStorage.setItem('token', res.data.token);
  //             // TODO: Store res.token (e.g., localStorage) and redirect to dashboard
  //             // alert('Sign-in successful! Welcome, ' + res.user.name);
  //           },
  //           error: (err) => {
  //             console.error('Sign-in error:', err);
  //             alert(
  //               err.status === 409
  //                 ? err.error.message
  //                 : 'Failed to sign in with Google.'
  //             );
  //           },
  //         });
  //     } else {
  //       alert('Google Sign-In failed. Please try again.');
  //     }
  //   });
  // }

  // googleSignIn(): void {
  //   this.googleIdentityService.googleSignIn();
  // }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log(response);
          this.loading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Login failed. Please try again.';
        },
      });
    }
  }
}
