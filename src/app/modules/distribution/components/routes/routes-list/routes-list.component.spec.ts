import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesListComponent } from './routes-list.component';

describe('ScheduleListComponent', () => {
  let component: RoutesListComponent;
  let fixture: ComponentFixture<RoutesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
