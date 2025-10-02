import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SearchParams, BookingRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private apiService: ApiService) { }

  // Search flights
  async searchFlights(params: SearchParams): Promise<any> {
    try {
      const queryParams = new URLSearchParams();

      if (params.date) queryParams.append('date', params.date);
      if (params.source) queryParams.append('source', params.source);
      if (params.destination) queryParams.append('destination', params.destination);
      if (params.airline) queryParams.append('airline', params.airline);

      const queryString = queryParams.toString();
      const url = `/flights/search${queryString ? '?' + queryString : ''}`;

      return await this.apiService.get(url);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Book a ticket
  async bookTicket(bookingData: BookingRequest): Promise<any> {
    try {
      return await this.apiService.post('/bookings', bookingData);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get my bookings (passenger)
  async getMyBookings(): Promise<any> {
    try {
      return await this.apiService.get('/bookings/my');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<any> {
    try {
      return await this.apiService.get(`/bookings/${id}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Cancel booking
  async cancelBooking(id: string): Promise<any> {
    try {
      return await this.apiService.put(`/bookings/${id}/cancel`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}