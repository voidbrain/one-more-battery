import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteriesMasterComponent } from './master.component';

describe('BatteriesMasterComponent', () => {
  let component: BatteriesMasterComponent;
  let fixture: ComponentFixture<BatteriesMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteriesMasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BatteriesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
