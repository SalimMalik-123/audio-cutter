import JSZip from "jszip";
import { AudioRegion, RegionExport, ExportOptions } from "../types";

export const exportRegion = async (
  audioBuffer: AudioBuffer,
  region: AudioRegion,
  options: ExportOptions
): Promise<{ blob: Blob; fileName: string }> => {
  const startSample = Math.floor(region.start * audioBuffer.sampleRate);
  const endSample = Math.floor(region.end * audioBuffer.sampleRate);
  const length = endSample - startSample;

  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    length,
    audioBuffer.sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0, region.start, region.end - region.start);

  const renderedBuffer = await offlineContext.startRendering();
  const blob = await audioBufferToWav(renderedBuffer);

  const prefix = options.prefix ? `${options.prefix}_` : "";
  const fileName = `${prefix}${String(options.startSequence).padStart(2, "0")}${
    options.fileType
  }`;

  return { blob, fileName };
};

export const exportAllRegions = async (
  audioBuffer: AudioBuffer,
  regions: AudioRegion[],
  options: ExportOptions
): Promise<Blob> => {
  const zip = new JSZip();
  const sortedRegions = [...regions].sort((a, b) => a.start - b.start);

  for (let i = 0; i < sortedRegions.length; i++) {
    const region = sortedRegions[i];
    const currentOptions = {
      ...options,
      startSequence: options.startSequence + i,
    };
    const { blob, fileName } = await exportRegion(
      audioBuffer,
      region,
      currentOptions
    );
    zip.file(fileName, blob);
  }

  return zip.generateAsync({ type: "blob" });
};

const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };

  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);

  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
  setUint16(buffer.numberOfChannels * 2);
  setUint16(16);

  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateRandomColor = (): string => {
  const colors = [
    "rgba(59, 130, 246, 0.3)",
    "rgba(16, 185, 129, 0.3)",
    "rgba(245, 158, 11, 0.3)",
    "rgba(239, 68, 68, 0.3)",
    "rgba(139, 92, 246, 0.3)",
    "rgba(236, 72, 153, 0.3)",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
