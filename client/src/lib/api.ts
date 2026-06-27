// API client for OgaFix backend
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Professional endpoints
export async function getProfessionals() {
  return apiCall('/api/professionals');
}

export async function getProfessional(id: string) {
  return apiCall(`/api/professionals/${id}`);
}

export async function searchProfessionals(query: string) {
  return apiCall(`/api/professionals/search?q=${encodeURIComponent(query)}`);
}

// Job endpoints
export async function getJobs() {
  return apiCall('/api/jobs');
}

export async function getJob(id: string) {
  return apiCall(`/api/jobs/${id}`);
}

export async function postJob(jobData: any) {
  return apiCall('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
}

export async function getJobBids(jobId: string) {
  return apiCall(`/api/jobs/${jobId}/bids`);
}

// Auth endpoints
export async function login(email: string, password: string) {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(userData: any) {
  return apiCall('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function logout() {
  return apiCall('/api/auth/logout', {
    method: 'POST',
  });
}

// Booking endpoints
export async function createBooking(bookingData: any) {
  return apiCall('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export async function getBookings() {
  return apiCall('/api/bookings');
}

export async function getBooking(id: string) {
  return apiCall(`/api/bookings/${id}`);
}

// Health check
export async function healthCheck() {
  return apiCall('/health');
}
