import { JobStatus, ProcessingRequest, SatelliteRequest } from "../data/types";

export class PointCloudAPIService {
  private static readonly BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://api.climateriskplan.com";

  static async startProcessingJob(
    request: ProcessingRequest
  ): Promise<{ success: boolean; job_id?: string; message?: string }> {
    const response = await fetch(`${this.BASE_URL}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start job: ${response.status}`);
    }

    return await response.json();
  }

  static async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${this.BASE_URL}/job/${jobId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  static async downloadFile(
    jobId: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const response = await fetch(`${this.BASE_URL}/download/${jobId}`);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];

    if (!reader) {
      throw new Error("Failed to get reader from response body");
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      loaded += value.length;

      if (onProgress && total > 0) {
        onProgress(Math.round((loaded / total) * 100));
      }
    }

    return new Blob(chunks);
  }

  static async fetchSatelliteImage(request: SatelliteRequest): Promise<Blob> {
    const response = await fetch(`${this.BASE_URL}/orthophoto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch satellite image: ${response.status}`);
    }

    return await response.blob();
  }

  static async fetchFloodOverhead(
    address: string,
    bboxM: number = 64.0,
    resolution: number = 2048
  ): Promise<Blob> {
    const response = await fetch(
      `${this.BASE_URL}/flood-overhead?address=${encodeURIComponent(
        address
      )}&bbox_m=${bboxM}&resolution=${resolution}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch flood data: ${response.status} ${response.statusText}`
      );
    }

    return await response.blob();
  }

  static async fetchWrtcOverhead(
    state: string,
    minLon: number,
    minLat: number,
    maxLon: number,
    maxLat: number,
    width: number = 512,
    height: number = 512
  ): Promise<Blob> {
    const params = new URLSearchParams({
      state: state,
      layer: "wildfire_hazard_potential",
      min_lon: minLon.toString(),
      min_lat: minLat.toString(),
      max_lon: maxLon.toString(),
      max_lat: maxLat.toString(),
      width: width.toString(),
      height: height.toString(),
      colormap: "Reds",
    });

    const response = await fetch(`${this.BASE_URL}/cog/raster?${params}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch WRTC data: ${response.status} ${response.statusText}`
      );
    }

    return await response.blob();
  }
}
