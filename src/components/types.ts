export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface ServiceOrder {
  id: number;
  service_code: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  battery_model: string;
  battery_serial: string;
  inverter_model: string;
  inverter_serial: string;
  issue_description: string;
  status: string;
  priority: string;
  payment_status: string;
  estimated_cost: string;
  final_cost: string;
  created_at: string;
  warranty_status: string;
  amc_status: string;
  battery_claim: string;
  estimated_completion_date: string;
  notes: string;
}

export interface Customer {
  id: number;
  customer_code: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  created_at: string;
  service_count: number;
}

export interface Battery {
  id: number;
  battery_code: string;
  battery_model: string;
  battery_serial: string;
  brand: string;
  capacity: string;
  voltage: string;
  battery_type: string;
  category: string;
  price: string;
  warranty_period: string;
  amc_period: string;
  inverter_model: string;
  battery_condition: string;
  is_spare: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_services: number;
  pending_services: number;
  total_customers: number;
  total_batteries: number;
  completed_services: number;
  urgent_priority: number;
  spare_batteries: number;
}

export interface Activity {
  activity: string;
  timestamp: string;
}

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
}