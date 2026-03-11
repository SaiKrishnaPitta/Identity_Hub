import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardComponentComponent } from './admin-dashboard-component.component';

describe('AdminDashboardComponentComponent', () => {
  let component: AdminDashboardComponentComponent;
  let fixture: ComponentFixture<AdminDashboardComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDashboardComponentComponent]
    });
    fixture = TestBed.createComponent(AdminDashboardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
