import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsMasterComponent } from './master.component';

describe('IncidentsMasterComponent', () => {
  let component: IncidentsMasterComponent;
  let fixture: ComponentFixture<IncidentsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsMasterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidentsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
