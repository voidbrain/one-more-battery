import { Component, OnInit } from '@angular/core';
import { TextAnimateComponent } from '../text-animate/text-animate';

@Component({
  selector: 'app-magic-terminal',
  templateUrl: './magic-terminal.html',
  styleUrls: ['./magic-terminal.scss'],
  standalone: true,
  imports: [TextAnimateComponent]
})
export class MagicTerminalComponent implements OnInit {

  commands = [
    { prompt: '$ ', command: 'gemini init --project=ai-showcase', output: 'Initializing Gemini AI project...'},
    { prompt: '$ ', command: 'npm install @google/gemini-ai', output: 'Installing dependencies... Complete!' },
    { prompt: '$ ', command: 'echo "TypeScript + Gemini CLI"', output: 'TypeScript + Gemini CLI' }
  ];

  constructor() { }

  ngOnInit() {}

}
