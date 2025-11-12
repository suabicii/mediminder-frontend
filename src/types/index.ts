export interface Medication {
  id: number;
  name: string;
  dosage: string;
  quantity: number;
  quantity_alert_threshold: number;
  dosage_schedule: 'once' | 'twice' | 'thrice' | 'custom';
  dosage_times: string[];
  created_at: string;
  updated_at: string;
  stock_days: number;
  is_low_stock: boolean;
}

export interface Dosage {
  id: number;
  medication: number;
  medication_name: string;
  scheduled_time: string;
  taken: boolean;
  taken_at: string | null;
  skipped: boolean;
  is_overdue: boolean;
}

export interface Intake {
  id: number;
  medication: number;
  medication_name: string;
  dosage: number | null;
  taken_at: string;
  quantity_taken: number;
}

export interface InventoryAlert {
  id: number;
  medication: number;
  medication_name: string;
  alert_type: 'low_stock' | 'out_of_stock';
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export interface DashboardData {
  today_dosages: Dosage[];
  overdue_dosages: Dosage[];
  active_alerts: InventoryAlert[];
}

export interface OCRExtractedData {
  name: string | null;
  dosage: string | null;
  quantity: number | null;
}

export interface OCREndpointResponse {
  message: string;
  extracted_data: OCRExtractedData;
  error?: string;
}

