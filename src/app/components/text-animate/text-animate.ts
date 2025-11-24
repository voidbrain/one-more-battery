import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-animate',
  templateUrl: './text-animate.html',
  styleUrls: ['./text-animate.scss'],
  standalone: true
})
export class TextAnimateComponent implements OnInit {
  @Input() text: string = '';
  @Input() speed: number = 100; // milliseconds per character
  @Input() delay: number = 0; // initial delay in milliseconds
  @Input() cursor: boolean = true;
  @Input() loop: boolean = false;

  displayedText: string = '';
  currentIndex: number = 0;
  isTyping: boolean = false;
  cursorVisible: boolean = false;
  cursorInterval: any;
  typingTimeout: any;

  ngOnInit() {
    if (this.delay > 0) {
      setTimeout(() => this.startTyping(), this.delay);
    } else {
      this.startTyping();
    }
  }

  ngOnDestroy() {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  startTyping() {
    if (this.isTyping) return;

    this.isTyping = true;
    this.currentIndex = 0;
    this.displayedText = '';
    this.animateText();
  }

  animateText() {
    if (this.currentIndex < this.text.length) {
      this.displayedText += this.text[this.currentIndex];
      this.currentIndex++;
      this.typingTimeout = setTimeout(() => this.animateText(), this.speed);
    } else {
      this.isTyping = false;
      if (this.loop) {
        setTimeout(() => this.startTyping(), 1000);
      }
    }
  }

  startCursorBlinking() {
    if (this.cursor && !this.cursorInterval) {
      this.cursorInterval = setInterval(() => {
        this.cursorVisible = !this.cursorVisible;
      }, 500);
    }
  }

  stopCursorBlinking() {
    if (this.cursorInterval) {
      clearInterval(this.cursorInterval);
      this.cursorInterval = null;
    }
    this.cursorVisible = false;
  }
}
