import axios from "axios";

// API Base URL (Ensure it's correct)
const API_BASE_URL = "http://localhost:5050/api/analytics";

// Get Auth Headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Define Interfaces
export interface SalesData {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  weeklyChange: number;
  monthlyChange: number;
}

export interface WorkloadData {
  hour: number;
  count: number;
}

export interface PopularItem {
  name: string;
  count: number;
}

// Fetch Sales Data
export const fetchSalesData = async (): Promise<SalesData | null> => {
  try {
    const response = await axios.get<SalesData>(`${API_BASE_URL}/sales-report`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return null;
  }
};

// Fetch Hourly Workload Data
export const fetchWorkloadData = async (): Promise<WorkloadData[]> => {
  try {
    const response = await axios.get<WorkloadData[]>(`${API_BASE_URL}/hourly-workload`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching workload data:", error);
    return [];
  }
};

// Fetch Top Selling Items
export const fetchPopularItems = async (): Promise<PopularItem[]> => {
  try {
    const response = await axios.get<PopularItem[]>(`${API_BASE_URL}/popular-items`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching popular items:", error);
    return [];
  }
};
