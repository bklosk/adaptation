export interface PointData {
  position: number[];
  color: number[];
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface JobStatus {
  job_id: string;
  status: string;
  address: string;
  created_at: string;
  completed_at?: string | null;
  output_file?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
  log_tail?: string[];
}

export interface ProcessingRequest {
  address: string;
  buffer_km: number;
}

export interface OrthophotoRequest {
  address: string;
  image_size?: string;
}

export interface OrthophotoData {
  imageUrl: string;
  width: number;
  height: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
