import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsAppFlowsComponent } from './whats-app-flows.component';

describe('WhatsAppFlowsComponent', () => {
  let component: WhatsAppFlowsComponent;
  let fixture: ComponentFixture<WhatsAppFlowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsAppFlowsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsAppFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
