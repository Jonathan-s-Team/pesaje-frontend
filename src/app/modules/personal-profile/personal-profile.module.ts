import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MyProfileComponent} from './my-profile.component';
import {PersonalProfileRoutingModule} from './personal-profile-routing.module';
import {CardsModule, DropdownMenusModule, WidgetsModule} from "../../_metronic/partials";
import {SharedModule} from "../../_metronic/shared/shared.module";
import {PersonalInformationComponent} from "./personal-information/personal-information.component";
import {InlineSVGModule} from "ng-inline-svg-2";
import {PersonalSettingsComponent} from "./settings/personal-settings.component";
import {PersonalProfileDetailsComponent} from "./settings/forms/profile-details/personal-profile-details.component";
import {AccountModule} from "../account/account.module";
import {PersonalSignInMethodComponent} from "./settings/forms/sign-in-method/personal-sign-in-method.component";
import {PersonalDeactivateAccountComponent} from "./settings/forms/deactivate-account/personal-deactivate-account.component";

@NgModule({
  declarations: [MyProfileComponent, PersonalInformationComponent, PersonalSettingsComponent, PersonalProfileDetailsComponent, PersonalSignInMethodComponent, PersonalDeactivateAccountComponent],
  imports: [
    CommonModule,
    PersonalProfileRoutingModule,
    InlineSVGModule,
    DropdownMenusModule,
    WidgetsModule,
    CardsModule,
    SharedModule,
    AccountModule
  ],
})
export class PersonalProfileModule {
}
