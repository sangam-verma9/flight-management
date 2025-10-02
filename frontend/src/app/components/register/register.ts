import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phone: string = '';
  role: 'PASSENGER' | 'ADMIN' = 'PASSENGER';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
    }
  }

  async onSubmit(): Promise<void> {
    this.error = '';
    this.success = '';
    this.loading = true;

    // Validation
    if (!this.username || !this.email || !this.password) {
      this.error = 'Please fill in all required fields';
      this.loading = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      this.loading = false;
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      this.loading = false;
      return;
    }

    try {
      const response = await this.authService.register({
        username: this.username,
        email: this.email,
        password: this.password,
        phone: this.phone,
        role: this.role
      });

      if (response.success) {
        this.success = 'Registration successful! Redirecting...';
        setTimeout(() => {
          this.redirectToDashboard();
        }, 1500);
      }
    } catch (error: any) {
      this.error = error.message || 'Registration failed. Please try again.';
      console.error('Registration error:', error);
    } finally {
      this.loading = false;
    }
  }

  private redirectToDashboard(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/passenger-dashboard']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}