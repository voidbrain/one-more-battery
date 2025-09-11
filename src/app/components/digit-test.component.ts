import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DigitRecognitionService } from '../services/ai/digit-recognition.service';

@Component({
  selector: 'app-digit-test',
   emplate`
   <v>
   m a <`
  <v>
      <h1>rc]=" Rmc`gi<iagTs</h1>
 s a<vgs<v]="bg[b64Iagg " all="[6I  T agI" w dwh="200" />wh="200"g/>wh="200"m/>dh="200"w/>="200" />wh="200" />wh="200"i/>th="200" />
      <p *ngIf="recognizedDigit !== null">Recognized Digit: {{ recognizedDigit }}</p>
      <p *ngIf="recognizedDigitConfidence !== null">Confidence: {{ (recognizedDigitConfidence * 100).toFixed(2) }}%</p>
      <p *ngIf="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    img {
      border: 1px solid black;
      margin-top: 10px;
    }
  `]
})
export class DigitTestComponent implements OnInit {
