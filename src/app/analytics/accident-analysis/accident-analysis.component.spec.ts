import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccidentAnalysisComponent } from './accident-analysis.component';

describe('AccidentAnalysisComponent', () => {
  let component: AccidentAnalysisComponent;
  let fixture: ComponentFixture<AccidentAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccidentAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccidentAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
