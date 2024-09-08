import { Component, OnInit } from '@angular/core';
import { MessagingService } from './services/messaging.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { TokenService } from './services/token.service';  // Import the service


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    private messagingService: MessagingService,
    private messaging: AngularFireMessaging,
    private swUpdate: SwUpdate,
    private tokenService: TokenService
  ) {}
  ngOnInit(){
    console.log("initss1")
    this.requestPermission();
    console.log("initss2")
    // this.messagingService.requestPermission().subscribe(() => {
    //   console.log('Notification permission granted.');
    // });

    // this.messagingService.receiveMessage().subscribe((payload) => {
    //   console.log('Message received:', payload);
    //   // Handle the received message
    // });
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm('New version available. Load new version?')) {
            window.location.reload();
          }
        });
    }
  }

  requestPermission() {
    try{
    this.messaging.requestPermission.subscribe({
      next: () => {
        console.log('Notification permission granted.');

        this.messaging.getToken.subscribe({
          next: (token) => {
            console.log('FCM Token:', token);
            this.tokenService.setToken(token!);
          },
          error: (error) => {
            console.error('Error getting token:', error);
          }
        });
      },
      error: (error) => {
        console.error('Notification permission denied:', error);
      }
    });
    this.messaging.getToken.subscribe({
      next: (token) => {
        console.log('FCM Token:', token);
        this.tokenService.setToken(token!);
      },
      error: (error) => {
        console.error('Error getting token:', error);
      }
    });
  }catch(e){console.log(e)}
  }

}
