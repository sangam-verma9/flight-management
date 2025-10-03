import { Component, OnInit } from '@angular/core';
import { FlightService } from '../../services/flight.service';
import { Flight, FlightRequest } from '../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-flight-management',
  templateUrl: './flight-management.html',
  imports: [FormsModule, CommonModule, NavbarComponent],
  styleUrls: ['./flight-management.css']
})
export class FlightManagementComponent implements OnInit {
  flights: any[] = [];
  filteredFlights: any[] = [];
  loading: boolean = false;
  error: string = '';

  searchTerm: string = '';

  showModal: boolean = false;
  isEditMode: boolean = false;
  modalLoading: boolean = false;

  currentFlight: FlightRequest = {
    airline: '',
    source: '',
    destination: '',
    total_seats: 0
  };

  selectedFlightId: string = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private flightService: FlightService) { }

  async ngOnInit(): Promise<void> {
    await this.loadFlights();
  }

  async loadFlights(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.flightService.getAllFlights();
      this.flights = response.flights || [];
      this.filteredFlights = [...this.flights];
    } catch (error: any) {
      this.error = 'Failed to load flights';
      console.error('Error loading flights:', error);
    } finally {
      this.loading = false;
    }
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFlights = [...this.flights];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredFlights = this.flights.filter(flight =>
      flight.airline?.toLowerCase().includes(term) ||
      flight.source?.toLowerCase().includes(term) ||
      flight.destination?.toLowerCase().includes(term)
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Please select a valid image file (JPEG, PNG, or GIF)';
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.error = 'File size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.error = '';

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    // Reset file input
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentFlight = {
      airline: '',
      source: '',
      destination: '',
      total_seats: 0
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(flight: any): void {
    this.isEditMode = true;
    this.selectedFlightId = flight._id;
    this.currentFlight = {
      airline: flight.airline,
      source: flight.source,
      destination: flight.destination,
      total_seats: flight.total_seats
    };
    this.selectedFile = null;
    this.imagePreview = flight.logo || null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentFlight = {
      airline: '',
      source: '',
      destination: '',
      total_seats: 0
    };
    this.selectedFlightId = '';
    this.selectedFile = null;
    this.imagePreview = null;
    this.error = '';
  }

  async saveFlight(): Promise<void> {
    if (!this.validateFlight()) {
      return;
    }

    this.modalLoading = true;
    this.error = '';

    try {
      const formData = new FormData();
      formData.append('airline', this.currentFlight.airline);
      formData.append('source', this.currentFlight.source);
      formData.append('destination', this.currentFlight.destination);
      formData.append('total_seats', this.currentFlight.total_seats.toString());

      if (this.selectedFile) {
        formData.append('logo', this.selectedFile);
      }

      if (this.isEditMode) {
        await this.flightService.updateFlight(this.selectedFlightId, formData);
        alert('Flight updated successfully!');
      } else {
        await this.flightService.createFlight(formData);
        alert('Flight created successfully!');
      }

      this.closeModal();
      await this.loadFlights();
    } catch (error: any) {
      this.error = error.message || 'Failed to save flight';
      console.error('Save flight error:', error);
    } finally {
      this.modalLoading = false;
    }
  }

  async deleteFlight(id: string, airline: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete flight: ${airline}?`)) {
      return;
    }

    this.loading = true;

    try {
      await this.flightService.deleteFlight(id);
      alert('Flight deleted successfully!');
      await this.loadFlights();
    } catch (error: any) {
      alert(error.message || 'Failed to delete flight. It may have existing schedules.');
      console.error('Delete flight error:', error);
    } finally {
      this.loading = false;
    }
  }

  validateFlight(): boolean {
    if (!this.currentFlight.airline?.trim()) {
      this.error = 'Airline name is required';
      return false;
    }
    if (!this.currentFlight.source?.trim()) {
      this.error = 'Source location is required';
      return false;
    }
    if (!this.currentFlight.destination?.trim()) {
      this.error = 'Destination location is required';
      return false;
    }
    if (this.currentFlight.source === this.currentFlight.destination) {
      this.error = 'Source and destination cannot be the same';
      return false;
    }
    if (!this.currentFlight.total_seats || this.currentFlight.total_seats < 1) {
      this.error = 'Total seats must be at least 1';
      return false;
    }
    return true;
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString();
  }

  getFlightStats() {
    return {
      total: this.flights.length,
      filtered: this.filteredFlights.length
    };
  }
}