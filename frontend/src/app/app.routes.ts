import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { OtpGuard } from './guards/otp.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/product-list/product-list.component').then(
        (m) => m.ProductListComponent
      ),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/products/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/order-list/order-list.component').then(
        (m) => m.OrderListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'addresses',
    loadComponent: () =>
      import('./pages/addresses/addresses.component').then(
        (m) => m.AddressesComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (m) => m.CategoriesComponent
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [GuestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgotPassword/forgotPassword.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'forgot-password/otp',
    loadComponent: () =>
      import('./pages/otp/otp.component').then((m) => m.OtpComponent),
    canActivate: [OtpGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/resetPassword/resetPassword.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./seller/admin/productForm.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
