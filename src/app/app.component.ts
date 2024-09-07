import { Component, OnInit } from '@angular/core';
import { MessagingService } from './services/messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private messagingService: MessagingService
  ) {}
  ngOnInit(){
    this.messagingService.requestPermission().subscribe(() => {
      console.log('Notification permission granted.');
    });

    this.messagingService.receiveMessage().subscribe((payload) => {
      console.log('Message received:', payload);
      // Handle the received message
    });
  }
}
