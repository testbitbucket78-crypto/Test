import { EnvironmentInjector, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor,HttpErrorResponse,HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';



@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private route:Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var token = localStorage.getItem('bearerToken')
        if (token != null) {
            // const isApiUrl = request.url.includes(environment.API_Keyword);
            if (token != null && token != "" ) {
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${localStorage.getItem('bearerToken')}`,
                    }
                });
            }
        }
       // return next.handle(request);

        return next.handle(request)
        .pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    if (event.body.someSpecificValue === 'specificResult') {
                        console.log('Specific result received!');
                    }
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.route.navigateByUrl('/login');
                    console.log('Unauthorized request');
                }
                return throwError(error);
            })
        );
    }
}