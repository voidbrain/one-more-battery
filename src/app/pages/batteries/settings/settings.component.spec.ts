import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatteriesSettingComponent } from './settings.component';

describe('BatteriesSettingComponent', () => {
  let component: BatteriesSettingComponent;
  let fixture: ComponentFixture<BatteriesSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatteriesSettingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BatteriesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
