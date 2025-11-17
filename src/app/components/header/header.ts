import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Theme, ThemeType } from '@services/ui/theme';
import { StyleType } from '@interfaces/index';
import { RichDropdown } from '../rich-dropdown/rich-dropdown';
import { DropdownOption } from '@interfaces/index';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  SegmentChangeEventDetail,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    TranslocoPipe,
    RichDropdown,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
  templateUrl: './header.html',
})
export class Header implements OnInit, OnDestroy {
  private router = inject(Router);
  private translocoService = inject(TranslocoService);
  private themeService = inject(Theme);
  private routerSubscription?: Subscription;

  protected activeSegment = signal('/batteries');

  // Language options
  protected languageOptions: DropdownOption[] = [
    { value: 'en', label: 'English', flag: 'flags/en.svg' },
    { value: 'it', label: 'Italiano', flag: 'flags/it.svg' },
  ];

  protected selectedLanguage = signal(this.translocoService.getActiveLang());

  // Theme options
  protected themeOptions: DropdownOption[] = [
    { value: 'light', label: 'Light', icon: 'sunny' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
  ];

  protected selectedTheme = signal(this.themeService.currentThemeValue);

  // Style options
  protected styleOptions: DropdownOption[] = [
    { value: 'default', label: 'Default', icon: 'square' },
    { value: 'liquid-glass', label: 'Liquid Glass', icon: 'diamond' },
  ];

  protected selectedStyle = signal(this.themeService.styleThemeValue);

  ngOnInit() {
    // Subscribe to router events to track current route
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveSegment(event.urlAfterRedirects);
      });

    // Set initial active segment based on current route
    this.updateActiveSegment(this.router.url);
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private updateActiveSegment(url: string) {
    const segments = url.split('/');
    const firstSegment = segments[1] || 'batteries';
    this.activeSegment.set(firstSegment);
  }

  protected onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>) {
    this.router.navigate([`${event.detail.value}`]);
  }

  protected onLanguageChange(language: string) {
    this.translocoService.setActiveLang(language);
    this.selectedLanguage.set(language);
  }

  protected onThemeChange(theme: string) {
    this.themeService.setTheme(theme as ThemeType);
    this.selectedTheme.set(theme as ThemeType);
  }

  protected onStyleChange(style: string) {
    this.themeService.setStyleTheme(style as StyleType);
    this.selectedStyle.set(style as StyleType);
  }
}
