import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-booking-history',
  templateUrl: './booking-history.html',
  imports: [FormsModule, CommonModule,NavbarComponent],
  styleUrls: ['./booking-history.css']
})
export class BookingHistoryComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  loading: boolean = false;
  error: string = '';

  filterStatus: string = 'ALL';
  searchTerm: string = '';

  selectedBooking: any = null;
  cancellingBooking: boolean = false;

  constructor(private bookingService: BookingService) { }

  async ngOnInit(): Promise<void> {
    await this.loadBookings();
  }

  async loadBookings(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.bookingService.getMyBookings();
      this.bookings = response.bookings || [];
      this.applyFilters();
    } catch (error: any) {
      this.error = 'Failed to load bookings';
      console.error('Error loading bookings:', error);
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      // Status filter
      const statusMatch = this.filterStatus === 'ALL' || booking.status === this.filterStatus;

      // Search filter
      const searchMatch = !this.searchTerm ||
        booking.schedule?.flight?.airline?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.schedule?.flight?.source?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.schedule?.flight?.destination?.toLowerCase().includes(this.searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  viewDetails(booking: any): void {
    this.selectedBooking = booking;
  }

  closeDetails(): void {
    this.selectedBooking = null;
  }

  async cancelBooking(bookingId: string): Promise<void> {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    this.cancellingBooking = true;

    try {
      await this.bookingService.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      this.closeDetails();
      await this.loadBookings();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel booking');
      console.error('Cancel booking error:', error);
    } finally {
      this.cancellingBooking = false;
    }
  }

  getStatusClass(status: string): string {
    return status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled';
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }

  getBookingStats() {
    return {
      total: this.bookings.length,
      confirmed: this.bookings.filter(b => b.status === 'CONFIRMED').length,
      cancelled: this.bookings.filter(b => b.status === 'CANCELLED').length
    };
  }
}