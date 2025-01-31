import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { DbService } from '../../../services/db.service';
import { FormControl, FormGroup } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuButton,
  IonRefresher,
  IonRow,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import * as THREE from 'three'; // Import Three.js
import { ElementRef } from '@angular/core';
import { DroneAnagraphInterface } from 'src/app/interfaces/drone-anagraph';

interface DronePart {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'working' | 'not-working';
}

@Component({
  selector: 'app-incidents-detail',
  standalone: true,
  imports: [
    IonBadge,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenu,
    IonMenuButton,
    IonRefresher,
    IonRow,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class IncidentsDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('droneCanvas2D') canvasRef2D!: ElementRef<HTMLCanvasElement>;
  @ViewChild('droneCanvas3D') canvasRef3D!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private wireframeMesh!: THREE.Mesh;

  private id: number = 0;
  public page = 'incidents';
  form = new FormGroup({
    name: new FormControl('John'),
    surname: new FormControl('Doe'),
    age: new FormControl(30),
  });

  constructor(
    public db: DbService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    addIcons(ionIcons);
  }

  // Define the parts of the drone
  parts: DronePart[] = [
    { name: 'topLeftMotor', x: 50, y: 50, width: 20, height: 20, status: 'working' },
    { name: 'topRightMotor', x: 330, y: 50, width: 20, height: 20, status: 'working' },
    { name: 'bottomLeftMotor', x: 50, y: 330, width: 20, height: 20, status: 'working' },
    { name: 'bottomRightMotor', x: 330, y: 330, width: 20, height: 20, status: 'working' },
    { name: 'topLeftArm', x: 70, y: 70, width: 80, height: 10, status: 'working' },
    { name: 'topRightArm', x: 250, y: 70, width: 80, height: 10, status: 'working' },
    { name: 'bottomLeftArm', x: 70, y: 320, width: 80, height: 10, status: 'working' },
    { name: 'bottomRightArm', x: 250, y: 320, width: 80, height: 10, status: 'working' },
    { name: 'topPlate', x: 150, y: 150, width: 100, height: 10, status: 'working' },
    { name: 'bottomPlate', x: 150, y: 240, width: 100, height: 10, status: 'working' },
    { name: 'midPlate', x: 150, y: 195, width: 100, height: 10, status: 'working' },
    { name: 'cameraPlateLeft', x: 130, y: 170, width: 10, height: 40, status: 'working' },
    { name: 'cameraPlateRight', x: 260, y: 170, width: 10, height: 40, status: 'working' },
    { name: 'fcModule', x: 190, y: 180, width: 20, height: 20, status: 'working' },
    { name: 'escModule', x: 190, y: 210, width: 20, height: 20, status: 'working' },
    { name: 'camera', x: 190, y: 160, width: 20, height: 20, status: 'working' },
    { name: 'cameraTx', x: 190, y: 140, width: 20, height: 20, status: 'working' },
    { name: 'cameraAntenna', x: 190, y: 120, width: 10, height: 30, status: 'working' },
    { name: 'cameraAntennaLeft', x: 170, y: 110, width: 10, height: 40, status: 'working' },
    { name: 'cameraAntennaRight', x: 210, y: 110, width: 10, height: 40, status: 'working' },
    { name: 'elrsModule', x: 190, y: 100, width: 20, height: 20, status: 'working' }
  ];

  private partStatus: { [key: string]: boolean } = {
    'topLeftMotor': true, 'topRightMotor': true, 'bottomLeftMotor': false, 'bottomRightMotor': true,
    'topLeftArm': true, 'topRightArm': true, 'bottomLeftArm': true, 'bottomRightArm': false,
    'topPlate': true, 'bottomPlate': true, 'midPlate': true,
    'cameraPlateLeft': true, 'cameraPlateRight': true,
    'fcModule': true, 'escModule': false, 'camera': true,
    'cameraTx': true, 'cameraAntenna': true,
    'cameraAntennaLeft': true, 'cameraAntennaRight': false,
    'elrsModule': true
  };

  ngOnInit(): void {
    this.id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.db.load();
    this.getItem(+(this.route.snapshot.paramMap.get('id') as string));

    // Initialize basic properties that don't depend on DOM or view
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  }

  ngAfterViewInit(): void {
    // if (this.canvasRef2D && this.canvasRef2D.nativeElement) {
    //   this.ctx = this.canvasRef3D.nativeElement.getContext('2d')!;
    //   this.drawDrone();
    // }

    // Only access canvasRef after view is initialized
    if (this.canvasRef3D && this.canvasRef3D.nativeElement) {


      // Initialize the WebGLRenderer here, where canvasRef3D is available
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef3D.nativeElement });
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      // Create and add your mesh to the scene
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        wireframe: true,
      });
      this.wireframeMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.wireframeMesh);

      // Position the camera to view the wireframe from a distance
      this.camera.position.z = 5;

      // Start the animation loop to render the scene
      this.animate();
    } else {
      console.error('Canvas reference is not available!');
    }
  }

  // The animate function that updates the Three.js scene
  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer?.render(this.scene!, this.camera!);
  };

  private drawDrone() {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 3;

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const size = 100;

    // Draw Arms (X shape)
    this.drawPart(centerX - size, centerY - size, centerX + size, centerY + size, 'topLeftArm', centerX - size - 20, centerY - size);
    this.drawPart(centerX + size, centerY - size, centerX - size, centerY + size, 'topRightArm', centerX + size + 20, centerY - size);
    this.drawPart(centerX - size, centerY + size, centerX + size, centerY - size, 'bottomLeftArm', centerX - size - 20, centerY + size);
    this.drawPart(centerX + size, centerY + size, centerX - size, centerY - size, 'bottomRightArm', centerX + size + 20, centerY + size);
  }

  private drawPart(
    x1: number, y1: number, x2: number, y2: number, name: string, offsetX: number, offsetY: number
  ) {
    const { ctx } = this;
    const status = this.partStatus[name] ? 'working' : 'not-working';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = status === 'working' ? 'green' : 'red';
    ctx.stroke();
  }

  async getItem(id: number) {
    const DroneAnag: DroneAnagraphInterface[] =
      await this.db.getItems<DroneAnagraphInterface>('drones-anag');
  }

  goBack() {
    this.router.navigate(['/incidents']);
  }
}
