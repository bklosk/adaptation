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
  status: string;
  output_file?: string;
  error_message?: string;
}

export interface ProcessingRequest {
  address: string;
  buffer_km: number;
}
