import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficPatternsComponent } from './traffic-patterns.component';

describe('TrafficPatternsComponent', () => {
  let component: TrafficPatternsComponent;
  let fixture: ComponentFixture<TrafficPatternsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrafficPatternsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficPatternsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
