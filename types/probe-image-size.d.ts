declare module 'probe-image-size' {
  interface ProbeResult {
    width: number;
    height: number;
    type: string;
    mime: string;
    wUnits: string;
    hUnits: string;
  }

  function probe(url: string | NodeJS.ReadableStream): Promise<ProbeResult>;
  export = probe;
}
