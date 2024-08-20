import { BatteryStatusInterface } from "./battery-status";

export interface BatterySeriesAnagraphInterface {
    id?: number,
    enabled: number,
    deleted: number,
    label?: string,
    color?: string,
}

export interface BatteryAnagraphInterface {
    id?: number,
    enabled: number,
    deleted: number,
    cellsNumber?: number,
    typeId?: number,
    model?: string,
    brandId?: number,
    label: string,
    seriesId: number,
}
export interface ExtendedBatteryAnagraphInterface extends BatteryAnagraphInterface {
  series: BatterySeriesAnagraphInterface;
  lastStatus: BatteryStatusInterface,
  totalCycles: number,
  timeRange: number,
  alertLevel: string,
}
