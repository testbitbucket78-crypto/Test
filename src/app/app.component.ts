import { Component, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ChildActivationEnd, Router } from '@angular/router';
import { environment } from 'environments/environment';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'sb-admin-angular';
    constructor(public router: Router, private titleService: Title,private renderer: Renderer2) {
        this.router.events
            .pipe(filter(event => event instanceof ChildActivationEnd))
            .subscribe(event => {
                let snapshot = (event as ChildActivationEnd).snapshot;
                while (snapshot.firstChild !== null) {
                    snapshot = snapshot.firstChild;
                }
                if(environment?.chhanel == 'web')
                    this.titleService.setTitle('Engagezilla');
                else
                    this.titleService.setTitle('EngageKart');
            });
            if(environment?.chhanel == 'web')
                this.setFavicon('assets/faviconweb.ico')
    }

    // setFavicon(): void {
    //     const favicon = this.renderer.selectRootElement('#app-favicon', true);
    //     this.renderer.setAttribute(favicon, 'href', 'faviconweb.ico');
    //   }


    
      setFavicon(iconName: string): void {
        const favicon = this.renderer.selectRootElement('#app-favicon', true);
        this.renderer.setAttribute(favicon, 'href', `${iconName}?v=${new Date().getTime()}`);
      }
}
