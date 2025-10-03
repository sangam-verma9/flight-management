import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { SearchParams } from '../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
 
@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.html',
  imports: [FormsModule, CommonModule,NavbarComponent],
  // standalone: true,
  styleUrls: ['./flight-search.css']
})
export class FlightSearchComponent implements OnInit {
  searchParams: SearchParams = {
    date: '',
    source: '',
    destination: '',
    airline: ''
  };
 
  datefront=new Date().toISOString().split('T')[0];
 
  flights: any[] = [];
  loading: boolean = false;
  error: string = '';
  searched: boolean = false;
 
  selectedFlight: any = null;
  seatsToBook: number = 1;
  bookingInProgress: boolean = false;
 
  constructor(
    private bookingService: BookingService,
    private router: Router
  ) { }
 
  ngOnInit(): void {
    // Set default date to today
    const today = new Date();
    this.searchParams.date = today.toISOString().split('T')[0];
 
  }
 
  async searchFlights(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.flights = [];
    this.searched = true;
 
    try {
      const response = await this.bookingService.searchFlights(this.searchParams);
      const currTime = new Date();
      const depTime=new Date(this.searchParams.date || 0)
      if(depTime.getTime()<currTime.getTime()){
        this.error='Wrong date is given'
      }
else{
      this.flights = response.schedules || [];
 
      if (this.flights.length === 0) {
        this.error = 'No flights found for the given search criteria.';
      }
}
    } catch (error: any) {
      this.error = 'Failed to search flights. Please try again.';
      console.error('Error searching flights:', error);
    } finally {
      this.loading = false;
    }
  }
 
  selectFlight(flight: any): void {
    this.selectedFlight = flight;
    this.seatsToBook = 1;
  }
 
  closeBookingModal(): void {
    this.selectedFlight = null;
    this.seatsToBook = 1;
  }
 
  async confirmBooking(): Promise<void> {
    if (!this.selectedFlight || this.seatsToBook < 1) {
      return;
    }
 
    if (this.seatsToBook > this.selectedFlight.available_seats) {
      alert(`Only ${this.selectedFlight.available_seats} seats available`);
      return;
    }
 
    this.bookingInProgress = true;
 
    try {
      const response = await this.bookingService.bookTicket({
        schedule_id: this.selectedFlight._id,
        seats_booked: this.seatsToBook
      });
 
      if (response.success) {
        alert('Booking successful! 🎉');
        this.closeBookingModal();
        this.searchFlights(); // Refresh search results
        // Optionally navigate to bookings page
        // this.router.navigate(['/booking-history']);
      }
    } catch (error: any) {
      alert(error.message || 'Booking failed. Please try again.');
      console.error('Booking error:', error);
    } finally {
      this.bookingInProgress = false;
    }
  }
 
  formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }
 
  getDuration(departure: any, arrival: any): string {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
 
  clearSearch(): void {
    this.searchParams = {
      date: new Date().toISOString().split('T')[0],
      source: '',
      destination: '',
      airline: ''
    };
    this.flights = [];
    this.searched = false;
    this.error = '';
  }
}