import { EnvironmentInjector, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';



@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var token = localStorage.getItem('bearerToken')
        if (token != null) {
            const isApiUrl = request.url.includes(environment.API_Keyword);
            if (token != null && token != "" && isApiUrl) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${localStorage.getItem('bearerToken')}`,
                    }
                });
            }
        }
        return next.handle(request);
    }
}