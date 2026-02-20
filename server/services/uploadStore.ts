export interface FailedRecord {
  name: string;
  email: string;
  error: string;
}

export interface UploadStatus {
  state: "processing" | "done" | "error";
  progress: number;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  details: FailedRecord[];
}

const uploads = new Map<string, UploadStatus>();

export function createUpload(uploadId: string) {
  uploads.set(uploadId, {
    state: "processing",
    progress: 0,
    totalRecords: 0,
    processedRecords: 0,
    failedRecords: 0,
    details: [],
  });
}

export function getUpload(uploadId: string): UploadStatus | undefined {
  return uploads.get(uploadId);
}

export function updateUpload(uploadId: string, updates: Partial<UploadStatus>) {
  const existing = uploads.get(uploadId);
  if (!existing) return;

  uploads.set(uploadId, { ...existing, ...updates });
}
