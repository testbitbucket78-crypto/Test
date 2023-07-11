import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit {

  selectedTab = 0;

  constructor() { }

  ngOnInit(): void {
  }

  FaqsTitle: string[] = [

    'Conversations Related',
    'WhatsApp Template',
    'Flow Builder',
    'Campaign',
    'Funnel',
    'Plans'
    
  ];

  sampleQues: string[] = [
    'How to find the Facebook Business Manager ID',
    'Why can’t I see this conversation?',
    'Why I’m not able to see the user in the assignment list? My user is not able to see new chat/ I’m…',
    'I’m not able to send templates, getting error messages. (or) Messages are not being delivered',
    'I’m not able to send templates, getting error messages. (or) Messages are not being delivered',
    'What is message opt-in button in conversation?'
  ];


    conversationRelatedQuestions: string[] = [
      'How to find the Facebook Business Manager ID',
      'Why can’t I see this conversation?',
      'Why I’m not able to see the user in the assignment list? My user is not able to see new chat/ I’m…',
      'I’m not able to send templates, getting error messages. (or) Messages are not being delivered',
      'I’m not able to send templates, getting error messages.',
      'Why can’t I see this conversation?',
      'Why I’m not able to see the user in the assignment list? My user is not able to see new chat/ I’m…',
      'I’m not able to send templates, getting error messages. (or) Messages are not being delivered',
      'I’m not able to send templates, getting error messages.',
      'What is message opt-in button in conversation?',
      'I’m not able to send templates, getting error messages. (or) Messages are not being delivered',
      'I’m not able to send templates, getting error messages.',
      'What is message opt-in button in conversation?',
      'Why can’t I see this conversation?'
    ];


selectTab(tabNumber: number) {
  this.selectedTab = tabNumber;
}

}

