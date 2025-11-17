import { Injectable, signal } from '@angular/core';
import {
  BatteryStatus,
  Brand,
  Series,
  BatteryType,
  Battery,
  UsageRecord,
  ResistanceRecord,
  Settings,
  StyleType,
} from '@interfaces/index';

@Injectable({
  providedIn: 'root',
})
export class Sqlite {
  // Storage keys for different entities
  private readonly BATTERIES_KEY = 'angular-batteries';
  private readonly BRANDS_KEY = 'angular-brands';
  private readonly SERIES_KEY = 'angular-series';
  private readonly TYPES_KEY = 'angular-types';
  private readonly USAGE_RECORDS_KEY = 'angular-usage-records';
  private readonly RESISTANCE_RECORDS_KEY = 'angular-resistance-records';
  private readonly SETTINGS_KEY = 'angular-settings';

  // Signals for reactive data
  private batteries = signal<Battery[]>([]);
  private brands = signal<Brand[]>([]);
  private series = signal<Series[]>([]);
  private types = signal<BatteryType[]>([]);
  private usageRecords = signal<UsageRecord[]>([]);
  private resistanceRecords = signal<ResistanceRecord[]>([]);
  private settings = signal<Settings[]>([]);

  // ID counters
  private nextBatteryId = signal(1);
  private nextBrandId = signal(1);
  private nextSeriesId = signal(1);
  private nextTypeId = signal(1);
  private nextUsageRecordId = signal(1);
  private nextResistanceRecordId = signal(1);

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.loadFromStorage();

    console.log('Database initialized successfully');
  }

  private loadFromStorage(): void {
    try {
      // Load batteries
      const batteriesData = localStorage.getItem(this.BATTERIES_KEY);
      if (batteriesData) {
        const parsed = JSON.parse(batteriesData);
        this.batteries.set(parsed);
        const maxId = parsed.length > 0 ? Math.max(...parsed.map((b: Battery) => b.id)) : 0;
        this.nextBatteryId.set(maxId + 1);
      }

      // Load brands
      const brandsData = localStorage.getItem(this.BRANDS_KEY);
      if (brandsData) {
        const parsed = JSON.parse(brandsData);
        this.brands.set(parsed);
        const maxId = parsed.length > 0 ? Math.max(...parsed.map((b: Brand) => b.id)) : 0;
        this.nextBrandId.set(maxId + 1);
      }

      // Load series
      const seriesData = localStorage.getItem(this.SERIES_KEY);
      if (seriesData) {
        const parsed = JSON.parse(seriesData);
        this.series.set(parsed);
        const maxId = parsed.length > 0 ? Math.max(...parsed.map((s: Series) => s.id)) : 0;
        this.nextSeriesId.set(maxId + 1);
      }

      // Load types
      const typesData = localStorage.getItem(this.TYPES_KEY);
      if (typesData) {
        const parsed = JSON.parse(typesData);
        this.types.set(parsed);
        const maxId = parsed.length > 0 ? Math.max(...parsed.map((t: BatteryType) => t.id)) : 0;
        this.nextTypeId.set(maxId + 1);
      }

      // Load usage records
      const usageData = localStorage.getItem(this.USAGE_RECORDS_KEY);
      if (usageData) {
        const parsed = JSON.parse(usageData);
        this.usageRecords.set(parsed);
        const maxId = parsed.length > 0 ? Math.max(...parsed.map((u: UsageRecord) => u.id)) : 0;
        this.nextUsageRecordId.set(maxId + 1);
      }

      // Load resistance records
      const resistanceData = localStorage.getItem(this.RESISTANCE_RECORDS_KEY);
      if (resistanceData) {
        const parsed = JSON.parse(resistanceData);
        this.resistanceRecords.set(parsed);
        const maxId =
          parsed.length > 0 ? Math.max(...parsed.map((r: ResistanceRecord) => r.id)) : 0;
        this.nextResistanceRecordId.set(maxId + 1);
      }

      // Load settings
      const settingsData = localStorage.getItem(this.SETTINGS_KEY);
      if (settingsData) {
        this.settings.set(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.BATTERIES_KEY, JSON.stringify(this.batteries()));
      localStorage.setItem(this.BRANDS_KEY, JSON.stringify(this.brands()));
      localStorage.setItem(this.SERIES_KEY, JSON.stringify(this.series()));
      localStorage.setItem(this.TYPES_KEY, JSON.stringify(this.types()));
      localStorage.setItem(this.USAGE_RECORDS_KEY, JSON.stringify(this.usageRecords()));
      localStorage.setItem(this.RESISTANCE_RECORDS_KEY, JSON.stringify(this.resistanceRecords()));
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings()));
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  // Battery CRUD operations
  async insertBattery(battery: Omit<Battery, 'id'>): Promise<number> {
    const newBattery: Battery = {
      ...battery,
      id: this.nextBatteryId(),
    };

    const currentBatteries = this.batteries();
    this.batteries.set([...currentBatteries, newBattery]);
    this.nextBatteryId.set(this.nextBatteryId() + 1);
    this.saveToStorage();

    return newBattery.id;
  }

  async getBatteries(): Promise<Battery[]> {
    const batteries = this.batteries();
    // Join with related data
    return batteries.map((battery) => ({
      ...battery,
      brand: this.brands().find((b) => b.id === battery.brandId),
      series: this.series().find((s) => s.id === battery.seriesId),
      type: this.types().find((t) => t.id === battery.typeId),
    }));
  }

  async updateBattery(id: number, updates: Partial<Battery>): Promise<void> {
    const currentBatteries = this.batteries();
    const updatedBatteries = currentBatteries.map((battery) =>
      battery.id === id ? { ...battery, ...updates } : battery,
    );
    this.batteries.set(updatedBatteries);
    this.saveToStorage();
  }

  async deleteBattery(id: number): Promise<void> {
    const currentBatteries = this.batteries();
    const filteredBatteries = currentBatteries.filter((battery) => battery.id !== id);
    this.batteries.set(filteredBatteries);
    this.saveToStorage();
  }

  // Brand CRUD operations
  async insertBrand(label: string): Promise<number> {
    const newBrand: Brand = {
      id: this.nextBrandId(),
      label: label.trim(),
      deleted: 0,
      enabled: 1,
    };

    const currentBrands = this.brands();
    this.brands.set([...currentBrands, newBrand]);
    this.nextBrandId.set(this.nextBrandId() + 1);
    this.saveToStorage();

    return newBrand.id;
  }

  async getBrands(): Promise<Brand[]> {
    return this.brands().filter((brand) => brand.deleted === 0);
  }

  async updateBrand(id: number, label: string): Promise<void> {
    const currentBrands = this.brands();
    const updatedBrands = currentBrands.map((brand) =>
      brand.id === id ? { ...brand, label: label.trim() } : brand,
    );
    this.brands.set(updatedBrands);
    this.saveToStorage();
  }

  async deleteBrand(id: number): Promise<void> {
    const currentBrands = this.brands();
    const updatedBrands = currentBrands.map((brand) =>
      brand.id === id ? { ...brand, deleted: 1 } : brand,
    );
    this.brands.set(updatedBrands);
    this.saveToStorage();
  }

  // Series CRUD operations
  async insertSeries(label: string, color: string): Promise<number> {
    const newSeries: Series = {
      id: this.nextSeriesId(),
      label: label.trim(),
      color,
      deleted: 0,
      enabled: 1,
    };

    const currentSeries = this.series();
    this.series.set([...currentSeries, newSeries]);
    this.nextSeriesId.set(this.nextSeriesId() + 1);
    this.saveToStorage();

    return newSeries.id;
  }

  async getSeries(): Promise<Series[]> {
    return this.series().filter((series) => series.deleted === 0);
  }

  async updateSeries(id: number, label: string, color: string): Promise<void> {
    const currentSeries = this.series();
    const updatedSeries = currentSeries.map((series) =>
      series.id === id ? { ...series, label: label.trim(), color } : series,
    );
    this.series.set(updatedSeries);
    this.saveToStorage();
  }

  async deleteSeries(id: number): Promise<void> {
    const currentSeries = this.series();
    const updatedSeries = currentSeries.map((series) =>
      series.id === id ? { ...series, deleted: 1 } : series,
    );
    this.series.set(updatedSeries);
    this.saveToStorage();
  }

  // Type CRUD operations
  async insertType(label: string): Promise<number> {
    const newType: BatteryType = {
      id: this.nextTypeId(),
      label: label.trim(),
      deleted: 0,
      enabled: 1,
    };

    const currentTypes = this.types();
    this.types.set([...currentTypes, newType]);
    this.nextTypeId.set(this.nextTypeId() + 1);
    this.saveToStorage();

    return newType.id;
  }

  async getTypes(): Promise<BatteryType[]> {
    return this.types().filter((type) => type.deleted === 0);
  }

  async updateType(id: number, label: string): Promise<void> {
    const currentTypes = this.types();
    const updatedTypes = currentTypes.map((type) =>
      type.id === id ? { ...type, label: label.trim() } : type,
    );
    this.types.set(updatedTypes);
    this.saveToStorage();
  }

  async deleteType(id: number): Promise<void> {
    const currentTypes = this.types();
    const updatedTypes = currentTypes.map((type) =>
      type.id === id ? { ...type, deleted: 1 } : type,
    );
    this.types.set(updatedTypes);
    this.saveToStorage();
  }

  // Usage records
  async insertUsageRecord(usageRecord: Omit<UsageRecord, 'id'>): Promise<number> {
    const newRecord: UsageRecord = {
      ...usageRecord,
      id: this.nextUsageRecordId(),
    };

    const currentRecords = this.usageRecords();
    this.usageRecords.set([...currentRecords, newRecord]);
    this.nextUsageRecordId.set(this.nextUsageRecordId() + 1);
    this.saveToStorage();

    return newRecord.id;
  }

  async getUsageRecords(batteryId?: number): Promise<UsageRecord[]> {
    const records = this.usageRecords().filter((record) => record.deleted === 0);
    return batteryId ? records.filter((record) => record.idBattery === batteryId) : records;
  }

  // Resistance records
  async insertResistanceRecord(resistanceRecord: Omit<ResistanceRecord, 'id'>): Promise<number> {
    const newRecord: ResistanceRecord = {
      ...resistanceRecord,
      id: this.nextResistanceRecordId(),
    };

    const currentRecords = this.resistanceRecords();
    this.resistanceRecords.set([...currentRecords, newRecord]);
    this.nextResistanceRecordId.set(this.nextResistanceRecordId() + 1);
    this.saveToStorage();

    return newRecord.id;
  }

  async getResistanceRecords(batteryId?: number): Promise<ResistanceRecord[]> {
    const records = this.resistanceRecords().filter((record) => record.deleted === 0);
    return batteryId ? records.filter((record) => record.idBattery === batteryId) : records;
  }

  // Settings
  async insertSettings(
    showDismissedBatteries: boolean,
    batteryAlertDays: number = 30,
    styleTheme: StyleType = 'default',
    language: string = 'en',
  ): Promise<number> {
    const newSettings: Settings = {
      id: 1,
      showDismissedBatteries,
      batteryAlertDays,
      styleTheme,
      language,
    };

    this.settings.set([newSettings]);
    this.saveToStorage();

    return newSettings.id;
  }

  async getSettings(): Promise<Settings[]> {
    return this.settings();
  }

  async updateSettings(
    showDismissedBatteries: boolean,
    batteryAlertDays?: number,
    styleTheme?: StyleType,
    language?: string,
  ): Promise<void> {
    const updatedSettings = this.settings().map((setting) => ({
      ...setting,
      showDismissedBatteries,
      ...(batteryAlertDays !== undefined && { batteryAlertDays }),
      ...(styleTheme !== undefined && { styleTheme }),
      ...(language !== undefined && { language }),
    }));
    this.settings.set(updatedSettings);
    this.saveToStorage();
  }

  async fillWithMockData(): Promise<void> {
    this._fillWithMockData();
    this.saveToStorage();
  }

  async resetDatabase(): Promise<void> {
    localStorage.removeItem(this.BATTERIES_KEY);
    localStorage.removeItem(this.BRANDS_KEY);
    localStorage.removeItem(this.SERIES_KEY);
    localStorage.removeItem(this.TYPES_KEY);
    localStorage.removeItem(this.USAGE_RECORDS_KEY);
    localStorage.removeItem(this.RESISTANCE_RECORDS_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    this.initializeDatabase();
  }

  private _fillWithMockData(): void {
    // Add some default brands
    this.insertBrand('Tattu');
    this.insertBrand('Gaoneng');
    this.insertBrand('BetaFPV');

    // Add some default series
    this.insertSeries('Yellow', '#c4c41cff');
    this.insertSeries('Red', '#c61f1fff');
    this.insertSeries('Blue', '#252edaff');

    // Add some default types
    this.insertType('LiPo');
    this.insertType('LiHV');

    // Add some default batteries
    this.insertBattery({
      brandId: 1, // Tattu
      seriesId: 1, // Yellow
      typeId: 1, // LiPo
      cellsNumber: 6,
      date: '2025-11-13',
      label: '1',
      mA: 1400,
      model: 'R-Line',
      deleted: 0,
      enabled: 1,
    });
    this.insertBattery({
      brandId: 1, // Tattu
      seriesId: 1, // Yellow
      typeId: 1, // LiPo
      cellsNumber: 6,
      date: '2025-11-13',
      label: '2',
      mA: 1400,
      model: 'R-Line',
      deleted: 0,
      enabled: 1,
    });

    // Add some default usage records
    this.insertUsageRecord({
      idBattery: 1,
      date: '2025-11-13',
      status: BatteryStatus.Charged,
      deleted: 0,
      enabled: 1,
    });
    this.insertUsageRecord({
      idBattery: 1,
      date: '2025-11-11',
      status: BatteryStatus.Discharged,
      deleted: 0,
      enabled: 1,
    });
    this.insertUsageRecord({
      idBattery: 1,
      date: '2025-11-11',
      status: BatteryStatus.Charged,
      deleted: 0,
      enabled: 1,
    });
    this.insertUsageRecord({
      idBattery: 1,
      date: '2025-11-12',
      status: BatteryStatus.Stored,
      deleted: 0,
      enabled: 1,
    });
    this.insertUsageRecord({
      idBattery: 1,
      date: '2025-11-13',
      status: BatteryStatus.Discharged,
      deleted: 0,
      enabled: 1,
    });
    this.insertUsageRecord({
      idBattery: 1,
      date: '2025-11-13',
      status: BatteryStatus.Charged,
      deleted: 0,
      enabled: 1,
    });
    this.insertUsageRecord({
      idBattery: 1,
      date: '2025-11-13',
      status: BatteryStatus.Stored,
      deleted: 0,
      enabled: 1,
    });

    this.insertResistanceRecord({
      idBattery: 1,
      date: '2025-10-13',
      resistance_values: [12.5, 12.7, 12.6, 12.8, 12.9, 13.0],
      deleted: 0,
      enabled: 1,
    });
    this.insertResistanceRecord({
      idBattery: 1,
      date: '2025-11-13',
      resistance_values: [13.0, 13.2, 13.1, 13.3, 13.4, 13.5],
      deleted: 0,
      enabled: 1,
    });

    // Add default settings
    this.insertSettings(false);
  }

  // Legacy methods for backward compatibility
  async execute(sql: string): Promise<any[]> {
    console.log('Executing SQL:', sql);
    return [];
  }

  exportDatabase(): string {
    return JSON.stringify({
      batteries: this.batteries(),
      brands: this.brands(),
      series: this.series(),
      types: this.types(),
      usageRecords: this.usageRecords(),
      resistanceRecords: this.resistanceRecords(),
      settings: this.settings(),
    });
  }

  importDatabase(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.batteries) this.batteries.set(parsed.batteries);
      if (parsed.brands) this.brands.set(parsed.brands);
      if (parsed.series) this.series.set(parsed.series);
      if (parsed.types) this.types.set(parsed.types);
      if (parsed.usageRecords) this.usageRecords.set(parsed.usageRecords);
      if (parsed.resistanceRecords) this.resistanceRecords.set(parsed.resistanceRecords);
      if (parsed.settings) this.settings.set(parsed.settings);
      this.saveToStorage();
    } catch (error) {
      console.error('Error importing database:', error);
    }
  }

  close(): void {
    // Nothing to close for localStorage
  }
}
