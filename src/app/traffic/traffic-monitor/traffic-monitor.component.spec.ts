import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficMonitorComponent } from './traffic-monitor.component';

describe('TrafficMonitorComponent', () => {
  let component: TrafficMonitorComponent;
  let fixture: ComponentFixture<TrafficMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
