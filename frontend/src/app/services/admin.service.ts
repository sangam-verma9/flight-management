import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private apiService: ApiService) { }

  // Get all bookings (Admin)
  async getAllBookings(): Promise<any> {
    try {
      return await this.apiService.get('/admin/bookings');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get bookings by flight ID
  async getBookingsByFlight(flightId: string): Promise<any> {
    try {
      return await this.apiService.get(`/admin/bookings/flight/${flightId}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get bookings by schedule ID
  async getBookingsBySchedule(scheduleId: string): Promise<any> {
    try {
      return await this.apiService.get(`/admin/bookings/schedule/${scheduleId}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get flight occupancy report
  async getOccupancyReport(): Promise<any> {
    try {
      return await this.apiService.get('/admin/reports/occupancy');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get cancellation report
  async getCancellationReport(): Promise<any> {
    try {
      return await this.apiService.get('/admin/reports/cancellations');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get revenue report
  async getRevenueReport(): Promise<any> {
    try {
      return await this.apiService.get('/admin/reports/revenue');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<any> {
    try {
      return await this.apiService.get('/admin/dashboard');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}