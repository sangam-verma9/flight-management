import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, CommonModule],
  // standalone: true,
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  returnUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
    }

    // Get return url from route parameters or default
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  async onSubmit(): Promise<void> {
    this.error = '';
    this.loading = true;

    if (!this.email || !this.password) {
      this.error = 'Please enter email and password';
      this.loading = false;
      return;
    }

    try {
      const response = await this.authService.login(this.email, this.password);

      if (response.success) {
        // Redirect based on role
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.redirectToDashboard();
        }
      }
    } catch (error: any) {
      this.error = error.message || 'Login failed. Please try again.';
      console.error('Login error:', error);
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

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}