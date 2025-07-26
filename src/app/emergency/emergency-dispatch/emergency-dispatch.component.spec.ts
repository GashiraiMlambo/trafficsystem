import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyDispatchComponent } from './emergency-dispatch.component';

describe('EmergencyDispatchComponent', () => {
  let component: EmergencyDispatchComponent;
  let fixture: ComponentFixture<EmergencyDispatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyDispatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyDispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
