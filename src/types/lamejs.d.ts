declare module "lamejs" {
  export class Mp3Encoder {
    constructor(channels: number, samplerate: number, kbps: number);
    encodeBuffer(left: Int16Array, right?: Int16Array | null): Int8Array;
    flush(): Int8Array;
  }

  export default {
    Mp3Encoder,
  };
}
