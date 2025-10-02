import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { User, Booking } from '../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-passenger-dashboard',
  templateUrl: './passenger-dashboard.html',
  imports: [FormsModule, CommonModule, NavbarComponent ],
  styleUrls: ['./passenger-dashboard.css']
})
export class PassengerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentBookings: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.currentUser = this.authService.currentUserValue;
    await this.loadRecentBookings();
  }

  async loadRecentBookings(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.bookingService.getMyBookings();
      this.recentBookings = response.bookings.slice(0, 5); // Show only 5 recent bookings
    } catch (error: any) {
      this.error = 'Failed to load bookings';
      console.error('Error loading bookings:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateToSearch(): void {
    this.router.navigate(['/flight-search']);
  }

  navigateToBookings(): void {
    this.router.navigate(['/booking-history']);
  }

  getStatusClass(status: string): string {
    return status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled';
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }
}