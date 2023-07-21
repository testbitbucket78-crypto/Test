import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavigationService } from 'Frontend/navigation/services';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
import { UserGuideSubtopic, UserGuideTitles } from 'Frontend/dashboard/models/profile.model';

@Component({
  selector: 'sb-userguide',
  templateUrl: './userguide.component.html',
  styleUrls: ['./userguide.component.scss']
})
export class UserguideComponent implements OnInit {

  spId:number = 0;
  UserGuideTitles:UserGuideTitles[]= [];
  UserGuideSubTopics:UserGuideSubtopic[] = [];
  initUserGuideSubTopics:UserGuideSubtopic[]= [];
  isExpanded: boolean[] = new Array(this.UserGuideSubTopics.length).fill(false);

  @Output() selectab = new EventEmitter<string> () ;
  constructor(private navigation:NavigationService, private apiservice:ProfileService) { }

  ngOnInit(): void {
    this.navigation._sideNavVisible$.next(false);
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getUserGuideTopics();
    this.getUserGuideSubTopics();
   

  }

  ngOnDestroy(): void {
    this.navigation._sideNavVisible$.next(true);
  }
  
  toggleSubTopicsDiv(index: number) {
    this.isExpanded[index] = !this.isExpanded[index];
  }
  
  
  previousPage() {
    this.navigation._sideNavVisible$.next(true) ;
    this.selectab.emit('0');
  
}



getUserGuideTopics() {
  this.apiservice.getUserGuideTitles().subscribe((response => {
    this.UserGuideTitles = response.topics;
    console.log(this.UserGuideTitles);
  }));
} 

getUserGuideSubTopics() { 
  this.apiservice.getUserGuideSubTopicsData(this.spId).subscribe((response => {
    this.UserGuideSubTopics = response.subtopics;
    this.initUserGuideSubTopics = response.subtopics;
    console.log(this.UserGuideSubTopics);
  }));
}

getSubTopicsForHeading(headingId: number) {

  if (this.UserGuideTitles && this.initUserGuideSubTopics) {
    const selectedTopic = this.UserGuideTitles.find(topic => topic.id === headingId);
    console.log(selectedTopic);

    if (selectedTopic) {
      const filteredSubtopics = this.initUserGuideSubTopics.filter(subtopic => subtopic.headings_id === selectedTopic.id);
      console.log(filteredSubtopics);
     this.UserGuideSubTopics = filteredSubtopics;
    }
  }

  return [];
}


}
