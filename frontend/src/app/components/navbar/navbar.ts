import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  // standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}