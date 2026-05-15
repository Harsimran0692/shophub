export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  authMethod: string;
  createdAt: Date;
}

export interface AuthResponse {
  status: string;
  data: { user: User; token: string };
  msg: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPassword {
  email: string;
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
  data: {
    email: string;
  };
}

export interface OtpRequest {
  otp: string;
  email: string;
}

export interface OtpResponse {
  status: string;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
}

export interface ResetPasswordResponse {
  status: string;
  message: string;
}

// Interface for Google Credential Response

export interface GoogleLoginRequest {
  idToken: string | null;
}

export interface GoogleLoginResponse {
  status: string;
  data: { user: User; token: string };
}

export interface GoogleUser {
  _id: string;
  role: string;
  name: string;
  email: string;
  authMethod: string;
}

export interface CredentialResponse {
  credential: string;
  select_by: string;
}

export interface GoogleUser {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  role: string;
  authMethod: string;
}
