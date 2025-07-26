import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationDetectionComponent } from './violation-detection.component';

describe('ViolationDetectionComponent', () => {
  let component: ViolationDetectionComponent;
  let fixture: ComponentFixture<ViolationDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViolationDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViolationDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
