import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  // constructor(private afMessaging: AngularFireMessaging) {}

  // requestPermission(): Observable<void> {
  //   return new Observable((observer) => {
  //     this.afMessaging.requestToken.subscribe({
  //       next: (token) => {
  //         console.log('FCM Token:', token);
  //         observer.next();
  //         observer.complete();
  //       },
  //       error: (error) => {
  //         console.error('Request permission error:', error);
  //         observer.error(error);
  //       },
  //     });
  //   });
  // }

  // receiveMessage() {
  //   return this.afMessaging.messages;
  // }
}
