// Battery management interfaces
export enum BatteryStatus {
  Charged = 1,
  Stored = 2,
  Discharged = 3,
}

export interface Brand {
  id: number;
  label: string;
  deleted: number;
  enabled: number;
}

export interface Series {
  id: number;
  label: string;
  color: string;
  deleted: number;
  enabled: number;
}

export interface BatteryType {
  id: number;
  label: string;
  deleted: number;
  enabled: number;
}

export interface Battery {
  id: number;
  brandId: number;
  seriesId: number;
  typeId: number;
  cellsNumber: number;
  date: string;
  label: string;
  mA: number;
  model: string;
  deleted: number;
  enabled: number;
  // Joined data
  brand?: Brand;
  series?: Series;
  type?: BatteryType;
}

export interface UsageRecord {
  id: number;
  idBattery: number;
  date: string;
  status: BatteryStatus;
  deleted: number;
  enabled: number;
}

export interface ResistanceRecord {
  id: number;
  idBattery: number;
  date: string;
  resistance_values: number[];
  deleted: number;
  enabled: number;
}

export type StyleType = 'default' | 'liquid-glass';

export interface Settings {
  id: number;
  showDismissedBatteries: boolean;
  batteryAlertDays: number;
  styleTheme: StyleType;
  language: string;
}

export interface whisperDownloadFilesProgress {
  file: string;
  loaded: number;
  progress: number;
  total: number;
  name: string;
  status: string;
}

export interface PhotoResult {
  dataUrl: string;
  format: string;
  saved: boolean;
}

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  flag?: string;
}

export interface ToastState {
  isOpen: boolean;
  message: string;
  duration: number;
  color: 'success' | 'warning' | 'danger' | 'primary';
  position: 'top' | 'bottom' | 'middle';
}

export interface LLMModel {
  id: string;
  name: string;
  type: 'embedder' | 'transcriber' | 'detector';
  size: number; // in MB
  description: string;
  compatibility: 'universal' | 'chrome-compatible' | 'safari-compatible';
  provider: 'Xenova' | 'onnx-community' | 'sentence-transformers';
  recommendedBrowsers?: string[];
  fallbackPriority: number; // Lower number = higher priority
}

export interface Command {
  command: string;
  examples: string[];
  params?: string[];
}

export interface CommandMatch {
  command: string | null;
  params: Record<string, string | number | number[] | undefined>;
}

export interface TranscriberData {
  isBusy: boolean;
  text: string;
  chunks: { text: string; timestamp: [number, number | null] }[];
  tps: number;
  language: string;
  model?: string;
}

export interface DetectionResult {
  label: string;
  score: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}
