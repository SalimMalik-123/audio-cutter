import lamejs from "lamejs";

export const audioBufferToMp3 = (buffer: AudioBuffer, bitrate = 128): Blob => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const mp3Encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, bitrate);

  const samples = buffer.length;
  const mp3Data: Int8Array[] = [];

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  const blockSize = 1152;
  let i = 0;

  while (i < samples) {
    const left = floatTo16BitPCM(channelData[0].subarray(i, i + blockSize));
    const right =
      numChannels > 1
        ? floatTo16BitPCM(channelData[1].subarray(i, i + blockSize))
        : null;

    const mp3buf = mp3Encoder.encodeBuffer(left, right);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    i += blockSize;
  }

  const end = mp3Encoder.flush();
  if (end.length > 0) {
    mp3Data.push(end);
  }

  return new Blob(mp3Data as BlobPart[], { type: "audio/mpeg" });
};

const floatTo16BitPCM = (float32: Float32Array): Int16Array => {
  const pcm = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    pcm[i] = Math.max(-1, Math.min(1, float32[i])) * 0x7fff;
  }
  return pcm;
};
