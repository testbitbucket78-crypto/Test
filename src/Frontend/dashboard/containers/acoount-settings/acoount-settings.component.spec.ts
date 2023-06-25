import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcoountSettingsComponent } from './acoount-settings.component';

describe('AcoountSettingsComponent', () => {
  let component: AcoountSettingsComponent;
  let fixture: ComponentFixture<AcoountSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcoountSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcoountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
