import { GncProgramsService } from "./api/gnc-programs.service";
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppComponent } from "./app.component";
import { routing } from "./app.routing";
import { AuthService } from "./auth/auth.service";
import { LoginComponent } from "./auth/login/login.component";
import { LogoutComponent } from "./auth/logout/logout.component";
import { RegisterComponent } from "./auth/register/register.component";
import { FooterComponent } from "./core/footer/footer.component";
import { SidebarComponent } from "./core/sidebar/sidebar.component";
import { TopbarComponent } from "./core/topbar/topbar.component";
import { HomeComponent } from "./home/home.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { DescModalComponent } from "./programs/desc-modal/desc-modal.component";
import { ProgramsComponent } from "./programs/programs.component";
import { SightsFormComponent } from "./programs/observations/form/form.component";
import { SightsListComponent } from "./programs/observations/list/list.component";
import { ObsMapComponent } from "./programs/observations/map/map.component";
import { ObsComponent } from "./programs/observations/obs.component";
import { UserDashboardComponent } from "./auth/user-dashboard/user-dashboard.component";
import { SpeciesComponent } from "./synthesis/species/species.component";
import { GncService } from "./api/gnc.service";
import { AboutComponent } from "./about/about.component";
import { AboutCustomComponent } from "./about/custom/custom.component";
import { AboutFixedComponent } from "./about/fixed/fixed.component";
import { HomeCustomComponent } from "./home/custom/custom.component";
import { FlowComponent } from './programs/observations/modalflow/flow/flow.component'
// import { FlowService } from './programs/observations/flow/flow.service'
import { FlowDirective } from './programs/observations/modalflow/flow/flow.directive'
import { OnboardComponent } from './programs/observations/modalflow/steps/onboard/onboard.component'
import { CommittedComponent } from './programs/observations/modalflow/steps/committed/committed.component'
import { CongratsComponent } from './programs/observations/modalflow/steps/congrats/congrats.component';
import { ModalFlowComponent } from './programs/observations/modalflow/modalflow.component';
import { RewardComponent } from './programs/observations/modalflow/steps/reward/reward.component';
import { ModalFlowService } from './programs/observations/modalflow/modalflow.service';
import { ProgramsResolve } from "./programs/programs-resolve.service";

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    routing,
  ],
  declarations: [
    AppComponent,
    ObsComponent,
    ObsMapComponent,
    SightsFormComponent,
    SightsListComponent,
    HomeComponent,
    HomeCustomComponent,
    ProgramsComponent,
    PageNotFoundComponent,
    DescModalComponent,
    SidebarComponent,
    FooterComponent,
    TopbarComponent,
    LoginComponent,
    RegisterComponent,
    LogoutComponent,
    UserDashboardComponent,
    SpeciesComponent,
    AboutComponent,
    AboutCustomComponent,
    AboutFixedComponent,
    FlowComponent,
    FlowDirective,
    OnboardComponent,
    CommittedComponent,
    CongratsComponent,
    ModalFlowComponent,
    RewardComponent,
  ],
  providers: [
    AuthService,
    GncService,
    GncProgramsService,
    // FlowService,
    ModalFlowService,
    ProgramsResolve,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DescModalComponent,
    LoginComponent,
    LogoutComponent,
    RegisterComponent,
    OnboardComponent,
    CommittedComponent,
    CongratsComponent,
    RewardComponent,
  ]
})
export class AppModule {}
