export enum batteryStatusActionEnum {
    'Charge' = 1,
    'Discharge' = 2,
    'Store' = 3,
}

export interface BatteryStatusInterface {
    id: number
    deleted: boolean,
    idBattery: number,
    action: number,
    date: Date,
}
