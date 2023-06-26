import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganisationalSettingsComponent } from './organisational-settings.component';

describe('OrganisationalSettingsComponent', () => {
  let component: OrganisationalSettingsComponent;
  let fixture: ComponentFixture<OrganisationalSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganisationalSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationalSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
