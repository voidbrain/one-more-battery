import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public appName = 'OneMoreBattery';
  public dbVersion = 2;

  constructor() { }
}
