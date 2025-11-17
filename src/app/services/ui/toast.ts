import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ToastState } from '@interfaces/index';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private transloco = inject(TranslocoService);
  private toastSignal = signal<ToastState>({
    isOpen: false,
    message: '',
    duration: 3000,
    color: 'primary',
    position: 'top',
  });

  // Getter for the toast signal
  get toastState() {
    return this.toastSignal.asReadonly();
  }

  // Battery operations
  showBatteryCreated() {
    this.showSuccess(this.transloco.translate('toast.battery.created'));
  }

  showBatteryUpdated() {
    this.showSuccess(this.transloco.translate('toast.battery.updated'));
  }

  showBatteryDeleted() {
    this.showSuccess(this.transloco.translate('toast.battery.deleted'));
  }

  showBatteryCharged() {
    this.showSuccess(this.transloco.translate('toast.battery.charged'));
  }

  showBatteryStored() {
    this.showSuccess(this.transloco.translate('toast.battery.stored'));
  }

  showBatteryDischarged() {
    this.showSuccess(this.transloco.translate('toast.battery.discharged'));
  }

  // Brand operations
  showBrandCreated() {
    this.showSuccess(this.transloco.translate('toast.brand.created'));
  }

  showBrandUpdated() {
    this.showSuccess(this.transloco.translate('toast.brand.updated'));
  }

  showBrandDeleted() {
    this.showSuccess(this.transloco.translate('toast.brand.deleted'));
  }

  // Series operations
  showSeriesCreated() {
    this.showSuccess(this.transloco.translate('toast.series.created'));
  }

  showSeriesUpdated() {
    this.showSuccess(this.transloco.translate('toast.series.updated'));
  }

  showSeriesDeleted() {
    this.showSuccess(this.transloco.translate('toast.series.deleted'));
  }

  // Type operations
  showTypeCreated() {
    this.showSuccess(this.transloco.translate('toast.type.created'));
  }

  showTypeUpdated() {
    this.showSuccess(this.transloco.translate('toast.type.updated'));
  }

  showTypeDeleted() {
    this.showSuccess(this.transloco.translate('toast.type.deleted'));
  }

  // Settings operations
  showUsageSettingsSaved() {
    this.showSuccess(this.transloco.translate('toast.settings.usageSaved'));
  }

  showAppSettingsSaved() {
    this.showSuccess(this.transloco.translate('toast.settings.appSaved'));
  }

  // Error operations
  showBatterySaveError() {
    this.showError(this.transloco.translate('toast.error.batterySave'));
  }

  showBatteryDeleteError() {
    this.showError(this.transloco.translate('toast.error.batteryDelete'));
  }

  showBrandSaveError() {
    this.showError(this.transloco.translate('toast.error.brandSave'));
  }

  showBrandDeleteError() {
    this.showError(this.transloco.translate('toast.error.brandDelete'));
  }

  showSeriesSaveError() {
    this.showError(this.transloco.translate('toast.error.seriesSave'));
  }

  showSeriesDeleteError() {
    this.showError(this.transloco.translate('toast.error.seriesDelete'));
  }

  showTypeSaveError() {
    this.showError(this.transloco.translate('toast.error.typeSave'));
  }

  showTypeDeleteError() {
    this.showError(this.transloco.translate('toast.error.typeDelete'));
  }

  showSettingsSaveError() {
    this.showError(this.transloco.translate('toast.error.settingsSave'));
  }

  showBatteryStatusError() {
    this.showError(this.transloco.translate('toast.error.batteryStatus'));
  }

  showSuccess(message: string, duration: number = 3000) {
    this.showToast(message, 'success', duration);
  }

  showError(message: string, duration: number = 3000) {
    this.showToast(message, 'danger', duration);
  }

  showWarning(message: string, duration: number = 3000) {
    this.showToast(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 3000) {
    this.showToast(message, 'primary', duration);
  }

  private showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'primary',
    duration: number = 3000,
  ) {
    this.toastSignal.set({
      isOpen: true,
      message,
      duration,
      color,
      position: 'bottom',
    });
  }

  dismissToast() {
    this.toastSignal.update((toast) => ({ ...toast, isOpen: false }));
  }
}
