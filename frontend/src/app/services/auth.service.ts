import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private apiService: ApiService) {
    const storedUser = localStorage.getItem('user');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Register new user
  async register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    role: 'PASSENGER' | 'ADMIN';
  }): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<AuthResponse>('/register', userData);

      if (response.success && response.token) {
        this.setUserData(response.user, response.token);
      }

      return response;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<AuthResponse>('/login', {
        email,
        password
      });

      if (response.success && response.token) {
        this.setUserData(response.user, response.token);
      }

      return response;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get user profile
  async getUserProfile(): Promise<User> {
    try {
      const response: any = await this.apiService.get('/me');
      return response.user;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.apiService.getToken();
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN';
  }

  // Check if user is passenger
  isPassenger(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'PASSENGER';
  }

  // Set user data in localStorage and subject
  private setUserData(user: User, token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}