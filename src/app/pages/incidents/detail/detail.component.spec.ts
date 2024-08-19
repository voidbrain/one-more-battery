import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsDetailComponent } from './detail.component';

describe('IncidentsDetailComponent', () => {
  let component: IncidentsDetailComponent;
  let fixture: ComponentFixture<IncidentsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
