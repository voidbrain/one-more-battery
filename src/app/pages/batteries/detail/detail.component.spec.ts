import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteriesDetailComponent } from './detail.component';

describe('BatteriesDetailComponent', () => {
  let component: BatteriesDetailComponent;
  let fixture: ComponentFixture<BatteriesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteriesDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BatteriesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
