import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Flight, Schedule, FlightRequest, ScheduleRequest } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  constructor(private apiService: ApiService) {}

  async createFlight(flightData: FlightRequest | FormData): Promise<any> {
    try {
      return await this.apiService.post('/flights', flightData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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

  // Update flight (with logo upload support)
  async updateFlight(id: string, flightData: Partial<FlightRequest> | FormData): Promise<any> {
    try {
      return await this.apiService.put(`/flights/${id}`, flightData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
