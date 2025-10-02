import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Flight, Schedule, FlightRequest, ScheduleRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  constructor(private apiService: ApiService) { }

  // ========== FLIGHT OPERATIONS (Admin) ==========

  // Create a new flight
  async createFlight(flightData: FlightRequest): Promise<any> {
    try {
      return await this.apiService.post('/flights', flightData);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get all flights
  async getAllFlights(): Promise<any> {
    try {
      return await this.apiService.get('/flights');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get flight by ID
  async getFlightById(id: string): Promise<any> {
    try {
      return await this.apiService.get(`/flights/${id}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Update flight
  async updateFlight(id: string, flightData: Partial<FlightRequest>): Promise<any> {
    try {
      return await this.apiService.put(`/flights/${id}`, flightData);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Delete flight
  async deleteFlight(id: string): Promise<any> {
    try {
      return await this.apiService.delete(`/flights/${id}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // ========== SCHEDULE OPERATIONS ==========

  // Create a new schedule
  async createSchedule(scheduleData: ScheduleRequest): Promise<any> {
    try {
      return await this.apiService.post('/schedules', scheduleData);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get all schedules
  async getAllSchedules(): Promise<any> {
    try {
      return await this.apiService.get('/schedules');
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Get schedule by ID
  async getScheduleById(id: string): Promise<any> {
    try {
      return await this.apiService.get(`/schedules/${id}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Update schedule
  async updateSchedule(id: string, scheduleData: Partial<ScheduleRequest>): Promise<any> {
    try {
      return await this.apiService.put(`/schedules/${id}`, scheduleData);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Delete schedule
  async deleteSchedule(id: string): Promise<any> {
    try {
      return await this.apiService.delete(`/schedules/${id}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}