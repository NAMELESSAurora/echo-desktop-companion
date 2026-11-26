export interface P2LParamRange {
  id: string;
  min: number;
  max: number;
  default: number;
}

export declare class P2LPlayer {
  readonly width: number;
  readonly height: number;
  readonly clips: string[];
  readonly parameters: string[];
  readonly expressions: string[];
  readonly hitAreas: string[];
  readonly advancedFeatures: number;
  view: { zoom: number; x: number; y: number };

  static create(
    canvas: HTMLCanvasElement,
    wasmUrl: string,
    rigUrl: string,
  ): Promise<P2LPlayer>;

  static fromBytes(
    canvas: HTMLCanvasElement,
    runtime: WebAssembly.Exports,
    bytes: Uint8Array,
  ): Promise<P2LPlayer>;

  play(id: string | null): void;
  expression(id: string | null): void;
  setAdvanced(features: number): number;
  hitTest(clientX: number, clientY: number): string | null;
  lookAt(x: number, y: number): void;
  lipSync(level: number): void;
  setParameter(id: string, value: number): void;
  parameterRanges(): P2LParamRange[];
  parameterValues(): number[];
  wind(x: number, y: number): void;
  behaviors(flags: number): void;
  resetSimulation(): void;
  start(): void;
  stop(): void;
  update(dt: number): void;
  draw(): void;
  dispose(): void;
}
