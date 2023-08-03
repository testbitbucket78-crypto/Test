import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStorageComponent } from './manage-storage.component';

describe('ManageStorageComponent', () => {
  let component: ManageStorageComponent;
  let fixture: ComponentFixture<ManageStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageStorageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
