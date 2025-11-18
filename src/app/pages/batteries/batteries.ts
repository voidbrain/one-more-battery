import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sqlite } from '@services/database/database.service';
import { Battery, Settings } from '@interfaces/index';
import {
  ActionSheetController,
  IonIcon,
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ResistanceModalComponent } from './resistance-modal/resistance-modal';
import { CyclesModalComponent } from './cycles-modal/cycles-modal';
import { ToastService } from '@services/ui/toast';
import { ActionsBar } from '@components/actions-bar/actions-bar';
import { PhotoResult } from '@interfaces/index';
import * as QRCode from 'qrcode';

interface BatteryWithStatus extends Battery {
  status: 'charged' | 'stored' | 'discharged';
  lastActionDate: Date;
  daysSinceLastAction: number;
  age: { years: number; months: number; days: number };
  cycleCount: number;
  alertStatus: 'green' | 'orange' | 'red';
  statusText: string;
}

@Component({
  selector: 'app-batteries',
  imports: [
    CommonModule,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslocoModule,
    ActionsBar,
    IonSpinner,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonText,
    IonButton,
  ],
  templateUrl: './batteries.html',
  styleUrl: './batteries.scss',
})
export class Batteries implements OnInit {
  private sqlite = inject(Sqlite);
  private actionSheetController = inject(ActionSheetController);
  private modalController = inject(ModalController);
  private transloco = inject(TranslocoService);
  private toast = inject(ToastService);

  protected batteriesWithStatus = signal<BatteryWithStatus[]>([]);
  protected groupedBatteries = signal<Map<string, BatteryWithStatus[]>>(new Map());
  protected isLoading = signal(false);
  protected settings = signal<Settings | null>(null);

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData() {
    this.isLoading.set(true);
    try {
      // Load settings
      const settingsList = await this.sqlite.getSettings();
      const appSettings = settingsList[0] || { batteryAlertDays: 3, showDismissedBatteries: false };
      this.settings.set(appSettings);

      // Load batteries
      const batteries = await this.sqlite.getBatteries();

      // Process batteries with status
      const batteriesWithStatus: BatteryWithStatus[] = [];

      for (const battery of batteries) {
        const batteryWithStatus = await this.processBatteryStatus(battery, appSettings);
        batteriesWithStatus.push(batteryWithStatus);
      }

      this.batteriesWithStatus.set(batteriesWithStatus);

      // Group by series
      const grouped = new Map<string, BatteryWithStatus[]>();
      for (const battery of batteriesWithStatus) {
        const seriesName = battery.series?.label || 'Unknown Series';
        if (!grouped.has(seriesName)) {
          grouped.set(seriesName, []);
        }
        grouped.get(seriesName)!.push(battery);
      }

      this.groupedBatteries.set(grouped);
    } catch (error) {
      console.error('Error loading battery data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async processBatteryStatus(
    battery: Battery,
    settings: Settings,
  ): Promise<BatteryWithStatus> {
    // Get usage records for this battery
    const usageRecords = await this.sqlite.getUsageRecords(battery.id);
    const sortedRecords = usageRecords.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Determine current status
    const lastRecord = sortedRecords[0];
    let status: 'charged' | 'stored' | 'discharged' = 'stored';
    let statusText = this.transloco.translate('batteries.status.stored');

    if (lastRecord) {
      switch (lastRecord.status) {
        case 1: // Charged
          status = 'charged';
          statusText = this.transloco.translate('batteries.status.charged');
          break;
        case 2: // Stored
          status = 'stored';
          statusText = this.transloco.translate('batteries.status.stored');
          break;
        case 3: // Discharged
          status = 'discharged';
          statusText = this.transloco.translate('batteries.status.discharged');
          break;
      }
    }

    // Calculate days since last action
    const lastActionDate = lastRecord ? new Date(lastRecord.date) : new Date(battery.date);
    const now = new Date();
    const daysSinceLastAction = Math.floor(
      (now.getTime() - lastActionDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Calculate age from first record or battery creation
    const firstRecord = sortedRecords[sortedRecords.length - 1];
    const creationDate = firstRecord ? new Date(firstRecord.date) : new Date(battery.date);
    const ageMs = now.getTime() - creationDate.getTime();
    const ageYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365));
    const ageMonths = Math.floor(
      (ageMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30),
    );
    const ageDays = Math.floor((ageMs % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));

    // Count cycles (each charge/discharge pair is a cycle)
    const cycleCount = Math.floor(
      sortedRecords.filter((r) => r.status === 1 || r.status === 3).length / 2,
    );

    // Determine alert status
    let alertStatus: 'green' | 'orange' | 'red' = 'green';
    if (status === 'stored' && daysSinceLastAction > settings.batteryAlertDays) {
      alertStatus = 'orange';
    }
    if (status === 'stored' && daysSinceLastAction > settings.batteryAlertDays * 2) {
      alertStatus = 'red';
    }

    return {
      ...battery,
      status,
      lastActionDate,
      daysSinceLastAction,
      age: { years: ageYears, months: ageMonths, days: ageDays },
      cycleCount,
      alertStatus,
      statusText,
    };
  }

  protected getStatusIcon(status: string): string {
    switch (status) {
      case 'charged':
        return 'battery-charging';
      case 'stored':
        return 'battery-half';
      case 'discharged':
        return 'battery-empty';
      default:
        return 'alert-circle';
    }
  }

  protected getAlertIcon(alertStatus: string): string {
    switch (alertStatus) {
      case 'green':
        return 'checkmark-circle';
      case 'orange':
        return 'alert-circle';
      case 'red':
        return 'close-circle';
      default:
        return 'alert-circle';
    }
  }

  protected formatTimeAgo(days: number): string {
    try {
      if (days === 0) return this.transloco.translate('batteries.time.today') || 'today';
      if (days === 1) return this.transloco.translate('batteries.time.dayAgo') || '1 day ago';
      if (days < 30)
        return (
          this.transloco.translate('batteries.time.daysAgo', { count: days }) || `${days} days ago`
        );
      if (days < 365)
        return (
          this.transloco.translate('batteries.time.monthsAgo', { count: Math.floor(days / 30) }) ||
          `${Math.floor(days / 30)} months ago`
        );
      return (
        this.transloco.translate('batteries.time.yearsAgo', { count: Math.floor(days / 365) }) ||
        `${Math.floor(days / 365)} years ago`
      );
    } catch (error) {
      // Fallback to English if translation fails
      if (days === 0) return 'today';
      if (days === 1) return '1 day ago';
      if (days < 30) return `${days} days ago`;
      if (days < 365) return `${Math.floor(days / 30)} months ago`;
      return `${Math.floor(days / 365)} years ago`;
    }
  }

  protected formatAge(age: { years: number; months: number; days: number }): string {
    const parts: string[] = [];
    if (age.years > 0) parts.push(`${age.years}y`);
    if (age.months > 0) parts.push(`${age.months}m`);
    if (age.days > 0) parts.push(`${age.days}d`);
    return parts.join(' ') || '0d';
  }

  protected async viewCycleLogs(battery: BatteryWithStatus) {
    const modal = await this.modalController.create({
      component: CyclesModalComponent,
      componentProps: {
        batteryId: battery.id,
        batteryLabel: battery.label,
      },
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: false,
    });

    await modal.present();
  }

  protected async viewResistanceLogs(battery: BatteryWithStatus) {
    const modal = await this.modalController.create({
      component: ResistanceModalComponent,
      componentProps: {
        batteryId: battery.id,
        batteryLabel: battery.label,
        cellsNumber: battery.cellsNumber,
      },
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: false,
    });

    await modal.present();
  }

  protected async openActionSheet(battery: BatteryWithStatus) {
    const actionSheet = await this.actionSheetController.create({
      header: `${this.transloco.translate('batteries.actions')} - ${battery.label}`,
      buttons: [
        {
          text: this.transloco.translate('actions.charge'),
          icon: 'battery-charging',
          handler: () => this.addUsageRecord(battery, 1), // Charged
          disabled: battery.status === 'charged',
        },
        {
          text: this.transloco.translate('actions.store'),
          icon: 'battery-half',
          handler: () => this.addUsageRecord(battery, 2), // Stored
          disabled: battery.status === 'stored',
        },
        {
          text: this.transloco.translate('actions.discharge'),
          icon: 'battery-empty',
          handler: () => this.addUsageRecord(battery, 3), // Discharged
          disabled: battery.status === 'discharged',
        },
        {
          text: this.transloco.translate('actions.cancel'),
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  private async addUsageRecord(battery: BatteryWithStatus, status: number) {
    try {
      await this.sqlite.insertUsageRecord({
        idBattery: battery.id,
        date: new Date().toISOString(),
        status,
        deleted: 0,
        enabled: 1,
      });

      // Reload data to update status
      await this.loadData();

      // Show success toast
      if (status === 1) {
        this.toast.showBatteryCharged();
      } else if (status === 2) {
        this.toast.showBatteryStored();
      } else {
        this.toast.showBatteryDischarged();
      }
    } catch (error) {
      console.error('Error adding usage record:', error);
      this.toast.showBatteryStatusError();
    }
  }

  // Event handlers for ActionsBar component
  protected async onQrCodeScanned(qrCode: string) {
    await this.processQrCode(qrCode);
  }

  protected async onPhotoTaken(photoResult: PhotoResult) {
    // Handle photo taken - for future AI operations
    console.log('Photo taken:', photoResult);
    // TODO: Implement AI processing for photos
  }

  private async processQrCode(qrCode: string) {
    try {
      // Parse battery ID from QR code (assuming it's in the form "Battery-ID")
      const scannedIdBattery = qrCode.split('-')[1];
      const batteryId = parseInt(scannedIdBattery.trim());

      if (isNaN(batteryId)) {
        this.toast.showError('Invalid QR code format');
        return;
      }

      // Find the battery
      const battery = this.batteriesWithStatus().find((b) => b.id === batteryId);

      if (!battery) {
        this.toast.showError('Battery not found');
        return;
      }

      // Open action panel for the found battery
      await this.openActionSheet(battery);
      this.toast.showSuccess(`Battery "${battery.label}" found and selected`);
    } catch (error) {
      console.error('Error processing QR code:', error);
      this.toast.showError('Failed to process QR code');
    }
  }

  protected async generateQrCode(battery: BatteryWithStatus) {
    try {
      const qrText = `Battery-${battery.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create a printable QR code document
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        this.toast.showError('Failed to open print window');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${battery.label}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin: 20px;
            }
            .qr-container {
              margin: 20px auto;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 8px;
              display: inline-block;
            }
            .qr-code {
              width: 256px;
              height: 256px;
              margin: 20px;
            }
            .qr-text {
              font-family: monospace;
              font-size: 14px;
              background: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              margin: 10px 0;
            }
            .battery-info {
              margin: 20px 0;
              font-size: 18px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h1>Battery QR Code</h1>
          <div class="battery-info">Battery: ${battery.label}</div>
          <div class="qr-container">
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
            <div class="qr-text">${qrText}</div>
          </div>
          <p>Scan this QR code to quickly identify this battery</p>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Wait a bit for the image to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      this.toast.showSuccess('QR code sent to printer');
    } catch (error) {
      console.error('Error generating QR code:', error);
      this.toast.showError('Failed to generate QR code');
    }
  }
}
