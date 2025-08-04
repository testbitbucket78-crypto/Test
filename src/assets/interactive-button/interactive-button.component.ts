import { Component, Input, OnChanges, SimpleChanges,OnInit} from '@angular/core';
 import { InteractiveButtonPayload } from 'Frontend/dashboard/models/interactiveButtons.model';
  import { BehaviorSubject, Subscription } from 'rxjs';
@Component({
  selector: 'interactive-button',
  templateUrl: './interactive-button.component.html',
  styleUrls: ['./interactive-button.component.scss']
})
export class InteractiveButtonComponent implements OnChanges , OnInit{
  @Input() interactiveButtons: any;
  @Input() width: any = '70%'
  @Input() renderedButtons: any[] = [];
@Input() renderedButtonsStream!: BehaviorSubject<any[]>;
  buttons: any;
   private renderedButtonsSub?: Subscription;

  ngOnInit(): void {
    if (this.renderedButtonsStream) {
      this.renderedButtonsSub = this.renderedButtonsStream.subscribe((renderedButtons) => {
        const payload = this.generatePayloadFromRendered(renderedButtons);
        if (payload?.action?.buttons) {
          this.buttons = payload?.action.buttons;
        } else if (payload?.action?.list) {
          this.buttons = [];
        }
      });
    }
  }
    ngOnDestroy(): void {
    this.renderedButtonsSub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(typeof this.interactiveButtons == 'string'){
      this.interactiveButtons = JSON.parse(this.interactiveButtons);
    }
    if (!this.interactiveButtons?.action) {
      //throw new Error("Please Enter A Valid Interactive Buttons Payload")
    }
    console.log(this.interactiveButtons?.action)
    this.buttons = this.interactiveButtons?.action?.buttons
  }

  generatePayloadFromRendered(rendered: any[]): any {
 const buttons: InteractiveButtonPayload[] = [];
  let listPayload = null;

  rendered.forEach(group => {
    const buttonText = group.children.button_text?.trim();
    if (!buttonText) return;

    const button: any = {
      type: this.getButtonType(group.id),
      title: buttonText,
      id: group.id,
    };

    if (group.id === 'url') {
      const extra = group.children.extra_field?.find((e: any) => e.id === 'hyperlink');
      if (extra?.extra_field_text) {
        button.url = extra.extra_field_text;
      }
    }

    if (group.id === 'phone') {
      const extra = group.children.extra_field?.find((e: any) => e.id === 'phone_number');
      if (extra?.extra_field_text) {
        button.phone_number = extra.extra_field_text;
      }
    }

    if (group.id === 'copy_button') {
      const extra = group.children.extra_field?.find((e: any) => e.id === 'offer_code');
      if (extra?.extra_field_text) {
        button.copy_code = extra.extra_field_text;
      }
    }

    if (group.id === 'list_messages') {
      const rows = group.children.extra_field.map((item: any, index: number) => ({
        title: item.extra_field_text?.trim() || `Option ${index + 1}`,
        id: item.id?.trim() || `row${index + 1}`,
      }));

      listPayload = {
        label: buttonText,
        sections: [{ title: buttonText, rows }],
      };
    }

    buttons.push(button);
  });

  return {
    to: '',
    action: listPayload ? { list: listPayload } : { buttons },
    type: listPayload ? 'list' : undefined
  };
}
    getButtonType(id: string): string {
        switch (id) {
          case 'quick_reply':
            return 'quick_reply';
          case 'url':
            return 'url';
          case 'phone':
            return 'call';
          case 'copy_button':
            return 'copy';
          case 'list_messages':
          return 'list';
          default:
            return 'reply';
        }
      }
}
