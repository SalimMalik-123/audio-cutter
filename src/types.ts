export interface AudioRegion {
  id: string;
  start: number;
  end: number;
  color?: string;
  drag?: boolean;
  resize?: boolean;
}

export interface RegionExport {
  id: string;
  name: string;
  blob: Blob;
}

export interface HistoryState {
  regions: AudioRegion[];
  timestamp: number;
}
