import {
    Component,
    ViewEncapsulation,
    Input,
    ViewChild,
    ElementRef,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IFlowComponent } from '../../flow/flow';
import { RegisterComponent } from '../../../../../auth/register/register.component';
import { LoginComponent } from '../../../../../auth/login/login.component';
import { AppConfig } from '../../../../../../conf/app.config';
import { AuthService } from '../../../../../auth/auth.service';
import { ModalsTopbarService } from '../../../../../core/topbar/modalTopbar.service';

@Component({
    templateUrl: './onboard.component.html',
    styleUrls: ['./onboard.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class OnboardComponent implements IFlowComponent, OnInit {
    RegistrationModalRef: NgbModalRef;
    LoginModalRef: NgbModalRef;
    timeout: any;
    AppConfig = AppConfig;
    @Input('data') data: any;
    @ViewChild('RegisterComponent', { static: true })
    RegisterComponent: ElementRef;
    @ViewChild('LoginComponent', { static: true }) LoginComponent: ElementRef;

    constructor(
        private modalService: ModalsTopbarService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.verifyAuthorization();
    }

    verifyAuthorization() {
        this.authService.authorized$.subscribe((value) => {
            if (value || AppConfig.signup === 'never') {
                return this.data.next();
            }

            if (this.authService.refreshRequest) {
                this.authService.refreshRequest.subscribe((refreshToken) => {
                    if (refreshToken && refreshToken.access_token) {
                        this.verifyAuthorization();
                    }
                });
            }
        });
    }

    // Actions
    register() {
        this.RegistrationModalRef = this.modalService.open(RegisterComponent, {
            centered: true,
        });
        this.RegistrationModalRef.result.then((_) => {
            this.authService.isLoggedIn().subscribe(
                (value) => value!,
                (reason) => {
                    console.debug('registration dismissed:', reason);
                }
            );
        });
    }

    login() {
        this.LoginModalRef = this.modalService.open(LoginComponent, {
            centered: true,
        });
        this.LoginModalRef.result.then((_) => {
            console.debug('[obs-flow] login resolved');
            this.authService.isLoggedIn().subscribe(
                (value) => !!value,
                (reason) => {
                    console.debug('login dismissed:', reason);
                }
            );
        });
    }

    continue() {
        console.debug('continue');
        this.data.next();
    }

    closeModal() {
        this.data.service.closeModal();
    }
}
