import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MyProfileComponent} from './my-profile.component';
import {PersonalProfileRoutingModule} from './personal-profile-routing.module';
import {CardsModule, DropdownMenusModule, WidgetsModule} from "../../_metronic/partials";
import {SharedModule} from "../../_metronic/shared/shared.module";
import {PersonalInformationComponent} from "./personal-information/personal-information.component";
import {InlineSVGModule} from "ng-inline-svg-2";

@NgModule({
  declarations: [MyProfileComponent,PersonalInformationComponent],
  imports: [
    CommonModule,
    PersonalProfileRoutingModule,
    InlineSVGModule,
    DropdownMenusModule,
    WidgetsModule,
    CardsModule,
    SharedModule],
})
export class PersonalProfileModule {
}
