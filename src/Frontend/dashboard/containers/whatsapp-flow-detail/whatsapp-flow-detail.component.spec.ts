import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappFlowDetailComponent } from './whatsapp-flow-detail.component';

describe('WhatsappFlowDetailComponent', () => {
  let component: WhatsappFlowDetailComponent;
  let fixture: ComponentFixture<WhatsappFlowDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsappFlowDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappFlowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
