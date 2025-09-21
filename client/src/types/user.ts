// types/User.ts

export interface UserProfile {
  age?: number;
  gender?: string;
  preferences?: string[];
  bio?: string;
  specialties?: string[];
  licenseNumber?: string;
  isVerified?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'therapist' | 'admin';
  profile: UserProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface Therapist extends User {
  role: 'therapist';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}