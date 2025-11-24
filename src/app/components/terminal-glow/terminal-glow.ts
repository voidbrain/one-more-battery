import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terminal-glow',
  templateUrl: './terminal-glow.html',
  styleUrls: ['./terminal-glow.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TerminalGlow implements OnInit {
  @Input() glowMode = false;

  asciiBanner = `
 ██████   █████  ████████ ████████ ███████ ██████      █████  ████████ ████████ ███████ ██████  ██    ██
██       ██   ██    ██       ██    ██      ██   ██    ██   ██ ██       ██       ██      ██   ██  ██  ██
██   ███ ███████    ██       ██    █████   ██████     ███████ ████████ ████████ ███████ ██████    ████
██    ██ ██   ██    ██       ██    ██      ██   ██    ██   ██       ██       ██ ██      ██   ██    ██
 ██████  ██   ██    ██       ██    ███████ ██   ██     ██   ██ ████████ ████████ ███████ ██   ██    ██
`;

  ngOnInit() {
    // Generate figlet-style ASCII banner for "One More Battery"
    this.generateAsciiBanner();
  }

  private generateAsciiBanner() {
    // Custom ASCII generation for retro effect
    this.asciiBanner = `
 ██████╗ ███╗   ██╗███████╗    ███╗   ███╗ ██████╗ ██████╗ ███████╗
██╔═══██╗████╗  ██║██╔════╝    ████╗ ████║██╔═══██╗██╔══██╗██╔════╝
██║   ██║██╔██╗ ██║█████╗      ██╔████╔██║██║   ██║██████╔╝█████╗
██║   ██║██║╚██╗██║██╔══╝      ██║╚██╔╝██║██║   ██║██╔══██╗██╔══╝
╚██████╔╝██║ ╚████║███████╗    ██║ ╚═╝ ██║╚██████╔╝██║  ██║███████╗
 ╚═════╝ ╚═╝  ╚══╝╚══════╝    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝

      ██████╗  █████╗ ████████╗████████╗███████╗██████╗ ██╗   ██╗
      ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗╚██╗ ██╔╝
      ██████╔╝███████║   ██║      ██║   █████╗  ██████╔╝ ╚████╔╝
      ██╔══██╗██╔══██║   ██║      ██║   ██╔══╝  ██╔══██╗  ╚██╔╝
      ██████╔╝██║  ██║   ██║      ██║   ███████╗██║  ██║   ██║
      ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝
    `;
  }
}
