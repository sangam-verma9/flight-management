// User Interface
export interface User {
    _id?: string;
    username: string;
    email: string;
    phone?: string;
    role: 'PASSENGER' | 'ADMIN';
    createdAt?: Date;
}

// Auth Response
export interface AuthResponse {
    success: boolean;
    user: User;
    token: string;
    message?: string;
}

// Flight Interface
export interface Flight {
    _id?: string;
    airline: string;
    source: string;
    destination: string;
    total_seats: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Schedule Interface
export interface Schedule {
    _id?: string;
    flight: Flight | string;
    departure_time: Date | string;
    arrival_time: Date | string;
    available_seats: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Booking Interface
export interface Booking {
    _id?: string;
    user: User | string;
    schedule: Schedule | string;
    seats_booked: number;
    booking_time: Date;
    status: 'CONFIRMED' | 'CANCELLED';
    createdAt?: Date;
    updatedAt?: Date;
}

// Search Params
export interface SearchParams {
    date?: string;
    source?: string;
    destination?: string;
    airline?: string;
}

// API Response
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
}

// Booking Request
export interface BookingRequest {
    schedule_id: string;
    seats_booked: number;
}

// Flight Create/Update
export interface FlightRequest {
    airline: string;
    source: string;
    destination: string;
    total_seats: number;
}

// Schedule Create/Update
export interface ScheduleRequest {
    flight: string;
    departure_time: string;
    arrival_time: string;
    available_seats: number;
}

// Report Interfaces
export interface OccupancyReport {
    flight_id: string;
    airline: string;
    route: string;
    total_schedules: number;
    total_seats_offered: number;
    total_seats_booked: number;
    available_seats: number;
    occupancy_rate: string;
    total_bookings: number;
}

export interface CancellationReport {
    summary: {
        total_bookings: number;
        confirmed_bookings: number;
        cancelled_bookings: number;
        cancellation_rate: string;
    };
    recent_cancellations: Booking[];
}

export interface DashboardStats {
    statistics: {
        total_flights: number;
        total_schedules: number;
        upcoming_schedules: number;
        total_passengers: number;
        total_bookings: number;
        confirmed_bookings: number;
        cancelled_bookings: number;
    };
    recent_bookings: Booking[];
}