import { JobStatus, ProcessingRequest } from "./types";

export class PointCloudAPIService {
  private static readonly BASE_URL = "http://localhost:8000";

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
}
