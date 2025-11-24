import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonRange
} from '@ionic/angular/standalone';
import { AuroraText } from '@components/aurora-text/aurora-text';
import { TerminalGlow } from '@components/terminal-glow/terminal-glow';
import { TextAnimateComponent } from '@components/text-animate/text-animate';
import { ShineBorderComponent } from '@components/shine-border/shine-border';
import { MagicTerminalComponent } from '@components/magic-terminal/magic-terminal';

@Component({
  selector: 'app-glass-showcase',
  templateUrl: './glass-showcase.html',
  styleUrls: ['./glass-showcase.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonIcon,
    IonLabel,
    IonRange,
    AuroraText,
    TerminalGlow,
    TextAnimateComponent,
    ShineBorderComponent,
    MagicTerminalComponent
  ]
})
export class GlassShowcase implements OnInit {

  opacity = 0.8;
  blur = 10;

  constructor() { }

  ngOnInit() {}

  updateOpacity(event: any) {
    this.opacity = event.detail.value;
  }

  updateBlur(event: any) {
    this.blur = event.detail.value;
  }

}
