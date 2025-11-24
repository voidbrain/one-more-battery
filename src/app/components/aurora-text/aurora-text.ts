import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aurora-text',
  templateUrl: './aurora-text.html',
  styleUrls: ['./aurora-text.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AuroraText implements OnInit {
  @Input() text: string = '';
  @Input() className?: string = '';

  characters: string[] = [];

  ngOnInit() {
    this.characters = this.text.split('');
  }
}
