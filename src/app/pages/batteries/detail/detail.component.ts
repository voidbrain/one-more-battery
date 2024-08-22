import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { DbService } from '../../../services/db.service';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BatteryStatusInterface } from 'src/app/interfaces/battery-status';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { BatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';

@Component({
  selector: 'app-batteries-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonRefresher,
    IonRefresherContent,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class BatteriesDetailComponent implements OnInit {
  private id: number = 0;
  public page = 'batteries';

  batteryAnagArr?: BatteryAnagraphInterface[] | undefined;

  form = new FormGroup({
    name: new FormControl('John'),
    surname: new FormControl('Doe'),
    age: new FormControl(30),
  });

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
    public router: Router,
  ) {
    addIcons(ionIcons);
  }

  async ngOnInit() {
    this.id = +(this.route.snapshot.paramMap.get('id') ?? 0);

    await this.db.load();

    this.form.events.subscribe((event) => {
      console.log(event);
    });
    this.getItem(+(this.route.snapshot.paramMap.get('id') as string));
    this.batteryAnagArr =
      await this.db.getItems<BatteryAnagraphInterface>('batteries-status');
  }

  async getItem(id: number) {
    const batteriesStatus: BatteryStatusInterface[] | undefined =
      await this.db.getItems<BatteryStatusInterface>('batteries-status');
  }

  formSubmitted(value: CustomEvent) {
    this.save(value as unknown as BatteryStatusInterface);
  }

  async save(value: BatteryStatusInterface) {
    await this.db.putItem(this.page, value);
    this.router.navigate([`tabs/${this.page}`]);
  }
}
