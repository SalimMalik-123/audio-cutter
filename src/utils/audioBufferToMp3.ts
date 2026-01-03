import * as lame from "@breezystack/lamejs";

export const audioBufferToMp3 = (buffer: AudioBuffer, bitrate = 128): Blob => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;

  const mp3Encoder = new lame.Mp3Encoder(numChannels, sampleRate, bitrate);

  const mp3Data: BlobPart[] = [];

  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : null;

  const blockSize = 1152;

  for (let i = 0; i < buffer.length; i += blockSize) {
    const leftChunk = floatTo16BitPCM(left.subarray(i, i + blockSize));
    const rightChunk = right
      ? floatTo16BitPCM(right.subarray(i, i + blockSize))
      : undefined;

    const mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);

    if (mp3buf.length > 0) {
      // 🔑 Ensure Uint8Array backed by ArrayBuffer
      mp3Data.push(new Uint8Array(mp3buf));
    }
  }

  const end = mp3Encoder.flush();
  if (end.length > 0) {
    mp3Data.push(new Uint8Array(end));
  }

  return new Blob(mp3Data, { type: "audio/mpeg" });
};

const floatTo16BitPCM = (input: Float32Array): Int16Array => {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    output[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
  }
  return output;
};
