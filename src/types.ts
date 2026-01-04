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

// export interface ExportOptions {
//   prefix: string;
//   startSequence: number;
//   fileType: string;
//   bitrate: any;
// }
export type ExportOptions = {
  fileType: ".wav" | ".mp3";
  bitrate?: 96 | 128 | 192 | 256;
  prefix?: string;
  startSequence: number;
  filename: string;
};
