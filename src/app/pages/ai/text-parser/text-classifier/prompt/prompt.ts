import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { TextClassifierService } from '@services/ai/text-classifier/text-classifier.service';
import { CommandMatch } from '@interfaces/index';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-classifier-prompt-text-input',
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.scss'],
  standalone: true,
  imports: [FormsModule, TranslocoModule, IonicModule, CommonModule],
})
export class InputCard {
  @Input() inputText = 'Charge battery 12 yellow series';
  @Output() inputTextChange = new EventEmitter<string>();

  @Input() command: CommandMatch | null = null;
  @Output() commandChange = new EventEmitter<CommandMatch | null>();

  private textClassifierService = inject(TextClassifierService);

  async embedText() {
    this.command = await this.textClassifierService.parseCommand(this.inputText);
    this.commandChange.emit(this.command);
    console.log('command:', this.command);
  }

  onInputTextChange(value: string) {
    this.inputText = value;
    this.inputTextChange.emit(value);
  }
}
