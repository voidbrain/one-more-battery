import { Component, inject, signal, OnInit } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sqlite } from '@services/database/database.service';
import { Theme, ThemeType } from '@services/ui/theme';
import { StyleType } from '@interfaces/index';
import { ToastService } from '@services/ui/toast';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToggle,
  IonInput,
  IonText,
  SegmentChangeEventDetail,
  AlertController,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonToggle,
    IonInput,
    IonText,
    IonSpinner
],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private sqlite = inject(Sqlite);
  private themeService = inject(Theme);
  private toast = inject(ToastService);
  private alertController = inject(AlertController);
  private transloco = inject(TranslocoService);

  protected activeTab = signal<'usage' | 'app'>('app');
  protected isLoading = signal(false);
  protected isSaving = signal(false);

  // Usage settings form
  protected usageForm = new FormGroup({
    showDismissedBatteries: new FormControl(false, [Validators.required]),
    batteryAlertDays: new FormControl(30, [Validators.required, Validators.min(1)]),
  });

  // App settings form
  protected appForm = new FormGroup({
    language: new FormControl('en', [Validators.required]),
    defaultTheme: new FormControl<ThemeType>('light', [Validators.required]),
    styleTheme: new FormControl<StyleType>('default', [Validators.required]),
  });

  protected availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
  ];

  protected availableThemes: { value: ThemeType; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  protected availableStyleThemes: { value: StyleType; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'liquid-glass', label: 'Liquid Glass' },
  ];

  async ngOnInit() {
    await this.loadSettings();
  }

  private async loadSettings() {
    this.isLoading.set(true);
    try {
      const settings = await this.sqlite.getSettings();

      if (settings.length > 0) {
        const appSettings = settings[0];
        this.usageForm.patchValue({
          showDismissedBatteries: appSettings.showDismissedBatteries,
          batteryAlertDays: appSettings.batteryAlertDays,
        });
      }

      // Load current theme, style theme and language preferences
      const currentTheme = this.themeService.currentThemeValue;
      const currentStyleTheme = this.themeService.styleThemeValue;
      const currentLanguage = settings.length > 0 ? settings[0].language : 'en';
      this.appForm.patchValue({
        defaultTheme: currentTheme,
        styleTheme: currentStyleTheme,
        language: currentLanguage,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected setActiveTab(tab: 'usage' | 'app') {
    this.activeTab.set(tab);
  }

  protected onTabChange(event: CustomEvent<SegmentChangeEventDetail>) {
    const value = event.detail.value;
    if (value === 'usage' || value === 'app') {
      this.setActiveTab(value);
    }
  }

  protected async saveUsageSettings() {
    if (this.usageForm.invalid) return;

    this.isSaving.set(true);
    try {
      const formValue = this.usageForm.value;
      await this.sqlite.updateSettings(
        formValue.showDismissedBatteries!,
        formValue.batteryAlertDays!,
      );
      this.toast.showUsageSettingsSaved();
    } catch (error) {
      console.error('Error saving usage settings:', error);
      this.toast.showSettingsSaveError();
    } finally {
      this.isSaving.set(false);
    }
  }

  protected async saveAppSettings() {
    if (this.appForm.invalid) return;

    this.isSaving.set(true);
    try {
      const formValue = this.appForm.value;

      // Save theme preference
      if (formValue.defaultTheme) {
        this.themeService.setTheme(formValue.defaultTheme);
      }

      // Save style theme preference
      if (formValue.styleTheme) {
        this.themeService.setStyleTheme(formValue.styleTheme);
      }

      // Save language preference to database
      if (formValue.language) {
        await this.sqlite.updateSettings(false, undefined, undefined, formValue.language);
        console.log('Language preference saved:', formValue.language);
        // This would integrate with the i18n service
      }

      this.toast.showAppSettingsSaved();
    } catch (error) {
      console.error('Error saving app settings:', error);
      this.toast.showSettingsSaveError();
    } finally {
      this.isSaving.set(false);
    }
  }

  protected async addMockData() {
    const alert = await this.alertController.create({
      header: 'Confirm Mock Data',
      message: 'Are you sure you want to add mock data? This will add new data to your database.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Add',
          handler: async () => {
            await this.sqlite.fillWithMockData();
            this.toast.showSuccess('Mock data added successfully!');
          },
        },
      ],
    });
    await alert.present();
  }

  protected async resetDatabase() {
    const alert = await this.alertController.create({
      header: 'Confirm Database Reset',
      message: 'Are you sure you want to reset the database? This will delete all your data.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Reset',
          handler: async () => {
            await this.sqlite.resetDatabase();
            this.toast.showSuccess('Database reset successfully!');
          },
        },
      ],
    });
    await alert.present();
  }

  protected resetToDefaults() {
    // Reset usage settings
    this.usageForm.patchValue({
      showDismissedBatteries: false,
    });

    // Reset app settings
    this.appForm.patchValue({
      language: 'en',
      defaultTheme: 'light',
    });
  }
}
