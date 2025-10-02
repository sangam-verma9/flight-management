import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleManagement } from './schedule-management';

describe('ScheduleManagement', () => {
  let component: ScheduleManagement;
  let fixture: ComponentFixture<ScheduleManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
