import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { STTEmbedderService } from '@services/ai/text-parser.service';
import { CommandMatch } from '@interfaces/index';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-card',
  templateUrl: './input-card.html',
  styleUrl: './input-card.scss',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    IonicModule,
    CommonModule,
  ],
})
export class InputCard {
  @Input() inputText = 'Charge battery 12 yellow series';
  @Output() inputTextChange = new EventEmitter<string>();

  @Input() command: CommandMatch | null = null;
  @Output() commandChange = new EventEmitter<CommandMatch | null>();

  private embedderService = inject(STTEmbedderService);

  async embedText() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.command = await (this.embedderService as any).parseCommand(this.inputText);
    this.commandChange.emit(this.command);
    console.log('command:', this.command);
  }

  onInputTextChange(value: string) {
    this.inputText = value;
    this.inputTextChange.emit(value);
  }
}
