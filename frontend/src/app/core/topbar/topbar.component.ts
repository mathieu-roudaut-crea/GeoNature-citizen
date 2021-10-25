import { Component, OnInit, Input, LOCALE_ID, Inject } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

import { AppConfig } from '../../../conf/app.config';
import { AuthService } from './../../auth/auth.service';
import { LoginComponent } from '../../auth/login/login.component';
import { LogoutComponent } from '../../auth/logout/logout.component';
import { RegisterComponent } from '../../auth/register/register.component';
import { ProgramsComponent } from '../../programs/programs.component';
import { Program } from '../../programs/programs.models';
import { GncProgramsService } from '../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ModalsTopbarService } from './modalTopbar.service';

declare global {
    interface Window {
        googleTranslateElementInit: any;
    }
}
window.googleTranslateElementInit = window.googleTranslateElementInit || null;
declare let google: any;

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
    title: string = AppConfig.appName;
    // isLoggedIn: boolean = false;
    username: string;
    AppConfig = AppConfig;
    isCollapsed = true;
    programs$ = new Subject<Program[]>();
    isAdmin = false;
    canDisplayAbout: boolean = AppConfig.about;
    canSignup: boolean = AppConfig.signup !== 'never';
    adminUrl: SafeUrl;
    userAvatar: string;
    logoImage: string;
    translationLanguage: string;

    @Input()
    displayTopbar: boolean;

    constructor(
        @Inject(LOCALE_ID) readonly localeId: string,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        private auth: AuthService,
        private modalService: ModalsTopbarService,
        protected http: HttpClient
    ) {
        const tmp = localStorage.getItem('username');
        this.username = tmp ? tmp.replace(/\"/g, '') : 'Anonymous';
        this.logoImage = AppConfig.API_ENDPOINT + '/media/logo.png';
        this.route.data
            .pipe(
                tap((data: { programs: Program[] }) => {
                    if (data && data.programs) {
                        this.programs$.next(data.programs);
                    } else {
                        // console.warn("topbar::getAllPrograms");
                        this.programService
                            .getAllPrograms()
                            .subscribe((programs) => {
                                this.programs$.next(programs);
                            });
                    }
                }),
                catchError((error) => throwError(error))
            )
            .subscribe();

        this.route.queryParams.subscribe((params) => {
            if (params['language']) {
                this.translationLanguage = params['language'];
                this.loadTranslation();
            }
        });
    }

    isLoggedIn(): Observable<boolean> {
        return this.auth.authorized$.pipe(
            map((value) => {
                if (value === true) {
                    this.username = localStorage.getItem('username');
                    if (
                        localStorage.getItem('userAvatar') &&
                        localStorage.getItem('userAvatar') != 'null'
                    )
                        this.userAvatar =
                            AppConfig.API_ENDPOINT +
                            '/media/' +
                            localStorage.getItem('userAvatar');
                }
                return value;
            })
        );
    }

    login(): void {
        this.modalService.open(LoginComponent, {
            size: 'lg',
            centered: true,
        });
    }

    register(): void {
        this.modalService.open(RegisterComponent, {
            size: 'lg',
            centered: true,
        });
    }

    logout(): void {
        this.modalService.open(LogoutComponent, {
            size: 'lg',
            centered: true,
        });
    }

    programs(): void {
        this.modalService.open(ProgramsComponent, {
            size: 'lg',
            windowClass: 'programs-modal',
            centered: true,
        });
    }

    ngOnInit(): void {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            this.auth.ensureAuthorized().subscribe(
                (user) => {
                    if (user && user['features'] && user['features'].id_role) {
                        this.username = user['features'].username;
                        this.isAdmin = user['features'].admin ? true : false;
                        if (this.isAdmin) {
                            const ADMIN_ENDPOINT = [
                                AppConfig.API_ENDPOINT,
                                // this.localeId,
                                'admin',
                                '',
                            ].join('/');
                            // const PROGRAM_ENDPOINT = ADMIN_ENDPOINT + "programsmodel/";
                            // this.adminUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                            //   PROGRAM_ENDPOINT + "?jwt=" + this.auth.getAccessToken()
                            // );
                            this.adminUrl = ADMIN_ENDPOINT;
                        }
                    }
                },
                (err) => {
                    console.error(err);
                    this.auth
                        .logout()
                        .then((logout) => {
                            console.log('Logout Status:', logout.status);
                        })
                        .catch((err) => {
                            console.error('Logout error:', err);
                        });
                    return throwError(err);
                }
            );
            /*this.auth.ensureAuthorized().pipe(
        tap(user => {
          console.log("ensureAuthorized result", user);
          if (user && user["features"] && user["features"].id_role) {
            this.username = user["features"].username;
            this.isAdmin = user["features"].admin ? true : false;
          }
        }),
        catchError(err => {
          console.error(err);
          this.auth
            .logout()
            .then(logout => {
              console.log("Logout Status:", logout.status);
            })
            .catch(err => {
              console.error("Logout error:", err);
            });
          return throwError(err);
        })
      );*/
        }
    }

    loadTranslation() {
        if (this.translationLanguage) {
            const splittedCookie = document.cookie.split('googtrans=');
            if (splittedCookie.length > 1) {
                const splittedEndCookie = splittedCookie[1].split(';');
                splittedEndCookie[0] = `/fr/${this.translationLanguage}`;

                let newCookie = splittedCookie[0] + 'googtrans=';
                for (let i = 0; i < splittedEndCookie.length; i++) {
                    newCookie += splittedEndCookie[i] + '; ';
                }
                document.cookie = newCookie;
            }
        }

        window.googleTranslateElementInit = function () {
            new google.translate.TranslateElement(
                { pageLanguage: 'fr' },
                'google_translate_element'
            );
            setTimeout(
                function () {
                    const select = <HTMLInputElement>(
                        document.getElementsByClassName('goog-te-combo')[0]
                    );
                    if (select) {
                        select.value = this.translationLanguage;
                        select.addEventListener('click', function () {
                            select.dispatchEvent(new Event('change'));
                        });
                        select.click();
                    }
                }.bind(this),
                1000
            );
        }.bind(this);

        const node = document.createElement('script');
        node.type = 'text/javascript';
        node.async = true;
        node.src =
            '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.getElementsByTagName('head')[0].appendChild(node);
    }
}
