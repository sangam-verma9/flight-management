import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.html',
  imports: [FormsModule, CommonModule,NavbarComponent],
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit {
  activeTab: string = 'occupancy';
  loading: boolean = false;
  error: string = '';

  // Occupancy Report Data
  occupancyData: any[] = [];

  // Cancellation Report Data
  cancellationData: any = null;

  // Revenue Report Data
  revenueData: any[] = [];

  constructor(private adminService: AdminService) { }

  async ngOnInit(): Promise<void> {
    await this.loadOccupancyReport();
  }

  async switchTab(tab: string): Promise<void> {
    this.activeTab = tab;
    this.error = '';

    switch (tab) {
      case 'occupancy':
        if (this.occupancyData.length === 0) {
          await this.loadOccupancyReport();
        }
        break;
      case 'cancellation':
        if (!this.cancellationData) {
          await this.loadCancellationReport();
        }
        break;
      case 'revenue':
        if (this.revenueData.length === 0) {
          await this.loadRevenueReport();
        }
        break;
    }
  }

  async loadOccupancyReport(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.adminService.getOccupancyReport();
      this.occupancyData = response.report || [];
    } catch (error: any) {
      this.error = 'Failed to load occupancy report';
      console.error('Error loading occupancy report:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadCancellationReport(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.adminService.getCancellationReport();
      this.cancellationData = response;
    } catch (error: any) {
      this.error = 'Failed to load cancellation report';
      console.error('Error loading cancellation report:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadRevenueReport(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.adminService.getRevenueReport();
      this.revenueData = response.report || [];
    } catch (error: any) {
      this.error = 'Failed to load revenue report';
      console.error('Error loading revenue report:', error);
    } finally {
      this.loading = false;
    }
  }

  async refreshCurrentReport(): Promise<void> {
    switch (this.activeTab) {
      case 'occupancy':
        await this.loadOccupancyReport();
        break;
      case 'cancellation':
        await this.loadCancellationReport();
        break;
      case 'revenue':
        await this.loadRevenueReport();
        break;
    }
  }

  getOccupancyColor(rate: string): string {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return '#28a745'; // Green
    if (numRate >= 50) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString();
  }

  getStatusClass(status: string): string {
    return status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled';
  }

  exportToCSV(reportType: string): void {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'occupancy':
        filename = 'occupancy_report.csv';
        csvContent = 'Airline,Route,Total Schedules,Seats Offered,Seats Booked,Available Seats,Occupancy Rate,Total Bookings\n';
        this.occupancyData.forEach(item => {
          csvContent += `${item.airline},${item.route},${item.total_schedules},${item.total_seats_offered},${item.total_seats_booked},${item.available_seats},${item.occupancy_rate},${item.total_bookings}\n`;
        });
        break;
      case 'revenue':
        filename = 'revenue_report.csv';
        csvContent = 'Airline,Route,Total Bookings,Seats Sold,Revenue Metric\n';
        this.revenueData.forEach(item => {
          csvContent += `${item.airline},${item.route},${item.total_confirmed_bookings},${item.total_seats_sold},${item.revenue_metric}\n`;
        });
        break;
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Helper methods for template calculations
  getTotalSeatsOffered(): number {
    return this.occupancyData.reduce((sum, item) => sum + item.total_seats_offered, 0);
  }

  getTotalSeatsBooked(): number {
    return this.occupancyData.reduce((sum, item) => sum + item.total_seats_booked, 0);
  }

  getTotalOccupancy(): string {
    if (this.occupancyData.length === 0) return '0%';
    const totalOffered = this.getTotalSeatsOffered();
    const totalBooked = this.getTotalSeatsBooked();
    if (totalOffered === 0) return '0%';
    return ((totalBooked / totalOffered) * 100).toFixed(1) + '%';
  }

  getTotalConfirmedBookings(): number {
    return this.revenueData.reduce((sum, item) => sum + item.total_confirmed_bookings, 0);
  }

  getTotalSeatsSold(): number {
    return this.revenueData.reduce((sum, item) => sum + item.total_seats_sold, 0);
  }

  getTotalRevenue(): number {
    return this.revenueData.reduce((sum, item) => sum + item.revenue_metric, 0);
  }
}