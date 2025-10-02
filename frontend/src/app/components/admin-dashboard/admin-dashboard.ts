import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  imports: [FormsModule, CommonModule,NavbarComponent],
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  recentBookings: any[] = [];
  loading: boolean = false;
  error: string = '';
  currentUser: any = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.currentUser = this.authService.currentUserValue;
    await this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.adminService.getDashboardStats();
      this.stats = response.statistics;
      this.recentBookings = response.recent_bookings.slice(0, 10);
    } catch (error: any) {
      this.error = 'Failed to load dashboard data';
      console.error('Error loading dashboard:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }

  getStatusClass(status: string): string {
    return status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled';
  }

  getOccupancyRate(): string {
    if (!this.stats) return '0%';
    const total = this.stats.total_schedules;
    const upcoming = this.stats.upcoming_schedules;
    if (total === 0) return '0%';
    return ((upcoming / total) * 100).toFixed(1) + '%';
  }

  getBookingSuccessRate(): string {
    if (!this.stats) return '0%';
    const total = this.stats.total_bookings;
    const confirmed = this.stats.confirmed_bookings;
    if (total === 0) return '0%';
    return ((confirmed / total) * 100).toFixed(1) + '%';
  }
}