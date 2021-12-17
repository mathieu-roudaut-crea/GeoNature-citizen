import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { share, map, catchError } from 'rxjs/operators';

import { AppConfig } from '../../conf/app.config';
import {
    LoginUser,
    RegisterUser,
    JWT,
    TokenRefresh,
    LoginPayload,
    LogoutPayload,
} from './models';

@Injectable()
export class AuthService {
    private headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    redirectUrl: string;
    authenticated$ = new BehaviorSubject<boolean>(this.hasRefreshToken());
    authorized$ = new BehaviorSubject<boolean>(
        this.hasAccessToken() && this.tokenExpiration(this.getAccessToken()) > 1
    );
    timeoutID: any = null;

    constructor(private http: HttpClient, private router: Router) {}

    login(user: LoginUser): Observable<LoginPayload> {
        const url = `${AppConfig.API_ENDPOINT}/login`;
        return this.http
            .post<LoginPayload>(url, user, { headers: this.headers })
            .pipe(
                map((user) => {
                    if (user) {
                        this.authenticate(user);
                    }
                    return user;
                })
            );
    }

    register(user: RegisterUser): Observable<any> {
        const url = `${AppConfig.API_ENDPOINT}/registration`;

        const select = <HTMLInputElement>(
            document.getElementsByClassName('goog-te-combo')[0]
        );
        const postData = select ? { ...user, language: select.value } : user;

        return this.http.post(url, postData).pipe(
            map((user) => {
                if (user['active']) {
                    this.authenticate(user);
                }
                return user;
            })
        );
    }

    authenticate(user: any): void {
        localStorage.setItem('access_token', user.access_token);
        this.authorized$.next(true);
        localStorage.setItem('refresh_token', user.refresh_token);
        this.authenticated$.next(true);
        localStorage.setItem('username', user.username);
        localStorage.setItem('userAvatar', user.userAvatar);

        window.parent.postMessage(
            {
                username: user.username,
                type: 'loggedIn',
            },
            '*'
        );
    }

    logout(): Promise<any> {
        const url = `${AppConfig.API_ENDPOINT}/logout`;
        this.authorized$.next(false);
        return this.http
            .post<LogoutPayload>(url, { headers: this.headers })
            .pipe(
                catchError((error) => {
                    console.error(`[logout] error`, error);
                    localStorage.removeItem('access_token');
                    // localStorage.removeItem("refresh_token");
                    this.authenticated$.next(false);
                    // localStorage.removeItem("username");
                    return this.router.navigateByUrl('/home');
                })
            )
            .toPromise()
            .then(() => {
                localStorage.clear();
                window.parent.postMessage(
                    {
                        type: 'logout',
                    },
                    '*'
                );
            });
    }

    ensureAuthorized(): Observable<LoginUser> {
        const url = `${AppConfig.API_ENDPOINT}/user/info`;
        return this.http.get<LoginUser>(url, { headers: this.headers });
    }

    performTokenRefresh(): Observable<TokenRefresh> {
        const url = `${AppConfig.API_ENDPOINT}/token_refresh`;
        const refresh_token = this.getRefreshToken();
        const headers = this.headers.set(
            'Authorization',
            `Bearer ${refresh_token}`
        );
        return this.http.post<TokenRefresh>(url, null, {
            headers: headers,
        });
    }

    selfDeleteAccount(_access_token): Promise<any> {
        const url = `${AppConfig.API_ENDPOINT}/user/delete`;
        return this.http.delete(url, { headers: this.headers }).toPromise();
    }

    isLoggedIn(): Observable<boolean> {
        return this.authorized$.pipe(share());
    }

    getRefreshToken(): string {
        return localStorage.getItem('refresh_token');
    }

    getAccessToken(): string {
        return localStorage.getItem('access_token');
    }

    public hasRefreshToken(): boolean {
        return !!localStorage.getItem('refresh_token');
    }

    private hasAccessToken(): boolean {
        return !!localStorage.getItem('access_token');
    }

    decodeToken(token: string): JWT {
        if (!token) return;
        const parts: any[] = token.split('.');
        if (parts.length != 3) return;
        try {
            return {
                header: JSON.parse(atob(parts[0])),
                payload: JSON.parse(atob(parts[1])),
            };
        } catch (error) {
            console.error(error);
            return;
        }
    }

    tokenExpiration(token: string): number {
        if (!token) return;
        const jwt = this.decodeToken(token);
        if (!jwt) return;
        const now: number = new Date().getTime();
        const delta: number = (jwt.payload.exp * 1000 - now) / 1000.0;
        return delta;
    }

    confirmEmail(token): Observable<any> {
        const url = `${AppConfig.API_ENDPOINT}/user/confirmEmail/${token}`;
        return this.http.get(url);
    }
}
