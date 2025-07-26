import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrashDetectionComponent } from './crash-detection.component';

describe('CrashDetectionComponent', () => {
  let component: CrashDetectionComponent;
  let fixture: ComponentFixture<CrashDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrashDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrashDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
