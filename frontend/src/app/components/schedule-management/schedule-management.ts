import { Component, OnInit } from '@angular/core';
import { FlightService } from '../../services/flight.service';
import { ScheduleRequest } from '../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
 
@Component({
  selector: 'app-schedule-management',
  templateUrl: './schedule-management.html',
  imports: [FormsModule, CommonModule,NavbarComponent],
  // standalone: true,
  styleUrls: ['./schedule-management.css']
})
export class ScheduleManagementComponent implements OnInit {
  schedules: any[] = [];
  filteredSchedules: any[] = [];
  flights: any[] = [];
  loading: boolean = false;
  error: string = '';
 
  searchTerm: string = '';
  filterStatus: string = 'ALL'; // ALL, UPCOMING, PAST
 
  showModal: boolean = false;
  isEditMode: boolean = false;
  modalLoading: boolean = false;
 
  currentSchedule: ScheduleRequest = {
    flight: '',
    departure_time: '',
    arrival_time: '',
    available_seats: 0,
    price: 0
  };
  datefront=new Date();
 
  selectedScheduleId: string = '';
 
  constructor(private flightService: FlightService) { }
 
  async ngOnInit(): Promise<void> {
    await this.loadFlights();
    await this.loadSchedules();
  }
 
  async loadFlights(): Promise<void> {
    try {
      const response = await this.flightService.getAllFlights();
      this.flights = response.flights || [];
    } catch (error: any) {
      console.error('Error loading flights:', error);
    }
  }
 
  async loadSchedules(): Promise<void> {
    this.loading = true;
    this.error = '';
 
    try {
      const response = await this.flightService.getAllSchedules();
      this.schedules = response.schedules || [];
      this.applyFilters();
    } catch (error: any) {
      this.error = 'Failed to load schedules';
      console.error('Error loading schedules:', error);
    } finally {
      this.loading = false;
    }
  }
 
  applyFilters(): void {
    let filtered = [...this.schedules];
 
    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(schedule =>
        schedule.flight?.airline?.toLowerCase().includes(term) ||
        schedule.flight?.source?.toLowerCase().includes(term) ||
        schedule.flight?.destination?.toLowerCase().includes(term)
      );
    }
 
    // Status filter
    const now = new Date();
    if (this.filterStatus === 'UPCOMING') {
      filtered = filtered.filter(schedule =>
        new Date(schedule.departure_time) > now
      );
    } else if (this.filterStatus === 'PAST') {
      filtered = filtered.filter(schedule =>
        new Date(schedule.departure_time) <= now
      );
    }
 
    // Sort by departure time (upcoming first)
    filtered.sort((a, b) =>
      new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
    );
 
    this.filteredSchedules = filtered;
  }
 
  onFilterChange(): void {
    this.applyFilters();
  }
 
  openAddModal(): void {
    this.isEditMode = false;
    this.currentSchedule = {
      flight: '',
      departure_time: '',
      arrival_time: '',
      available_seats: 0,
      price: 0
    };
 
    this.showModal = true;
  }
 
  openEditModal(schedule: any): void {
    this.isEditMode = true;
    this.selectedScheduleId = schedule._id;
 
    // Convert dates to datetime-local format
    const depTime = new Date(schedule.departure_time);
    const arrTime = new Date(schedule.arrival_time);
 
    this.currentSchedule = {
      flight: schedule.flight?._id || schedule.flight,
      departure_time: this.formatDateTimeLocal(depTime),
      arrival_time: this.formatDateTimeLocal(arrTime),
      available_seats: schedule.available_seats,
      price: schedule.price
    };
    this.showModal = true;
  }
 
  closeModal(): void {
    this.showModal = false;
    this.currentSchedule = {
      flight: '',
      departure_time: '',
      arrival_time: '',
      available_seats: 0,
      price: 0
    };
    this.selectedScheduleId = '';
    this.error = '';
  }
 
  async saveSchedule(): Promise<void> {
    if (!this.validateSchedule()) {
      return;
    }
 
    this.modalLoading = true;
    this.error = '';
 
    try {
      const scheduleData = {
        ...this.currentSchedule,
        departure_time: new Date(this.currentSchedule.departure_time).toISOString(),
        arrival_time: new Date(this.currentSchedule.arrival_time).toISOString()
      };
 
      if (this.isEditMode) {
        await this.flightService.updateSchedule(this.selectedScheduleId, scheduleData);
        alert('Schedule updated successfully!');
      } else {
        await this.flightService.createSchedule(scheduleData);
        alert('Schedule created successfully!');
      }
 
      this.closeModal();
      await this.loadSchedules();
    } catch (error: any) {
      this.error = error.message || 'Failed to save schedule';
      console.error('Save schedule error:', error);
    } finally {
      this.modalLoading = false;
    }
  }
 
  async deleteSchedule(id: string, flightName: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete this schedule for ${flightName}?`)) {
      return;
    }
 
    this.loading = true;
 
    try {
      await this.flightService.deleteSchedule(id);
      alert('Schedule deleted successfully!');
      await this.loadSchedules();
    } catch (error: any) {
      alert(error.message || 'Failed to delete schedule. It may have active bookings.');
      console.error('Delete schedule error:', error);
    } finally {
      this.loading = false;
    }
  }
 
  validateSchedule(): boolean {
    const depTime = new Date(this.currentSchedule.departure_time);
    const arrTime = new Date(this.currentSchedule.arrival_time);
    const currTime=new Date();
 
    if (!this.currentSchedule.flight) {
      this.error = 'Please select a flight';
      return false;
    }
    if (!this.currentSchedule.departure_time || depTime.getTime()<currTime.getTime()) {
     
      this.error = 'Departure time should be correct';
      return false;
    }
 
    if (!this.currentSchedule.arrival_time) {
      this.error = 'Arrival time is required';
      return false;
    }
 
 
 
    if (depTime >= arrTime) {
      this.error = 'Departure time must be before arrival time';
      return false;
    }
 
    const selectedFlight = this.flights.find(f => f._id === this.currentSchedule.flight);
    if (selectedFlight && this.currentSchedule.available_seats > selectedFlight.total_seats) {
      this.error = `Available seats cannot exceed total seats (${selectedFlight.total_seats})`;
      return false;
    }
 
    if (!this.currentSchedule.available_seats || this.currentSchedule.available_seats < 0) {
      this.error = 'Available seats must be 0 or more';
      return false;
    }
 
    return true;
  }
 
  formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
 
  formatDateTime(date: any): string {
    return new Date(date).toLocaleString();
  }
 
  isUpcoming(date: any): boolean {
    return new Date(date) > new Date();
  }
 
  getDuration(departure: any, arrival: any): string {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
 
  getScheduleStats() {
    const now = new Date();
    return {
      total: this.schedules.length,
      upcoming: this.schedules.filter(s => new Date(s.departure_time) > now).length,
      past: this.schedules.filter(s => new Date(s.departure_time) <= now).length,
      filtered: this.filteredSchedules.length
    };
  }
 
  getFlightById(id: string) {
    return this.flights.find(f => f._id === id);
  }
}