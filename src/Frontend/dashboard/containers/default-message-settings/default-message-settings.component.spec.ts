import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultMessageSettingsComponent } from './default-message-settings.component';

describe('DefaultMessageSettingsComponent', () => {
  let component: DefaultMessageSettingsComponent;
  let fixture: ComponentFixture<DefaultMessageSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultMessageSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultMessageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
