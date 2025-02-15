import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MyProfileComponent} from "./my-profile.component";
import {PersonalInformationComponent} from "./personal-information/personal-information.component";
import {PersonalSettingsComponent} from "./settings/personal-settings.component";

const routes: Routes = [
  {
    path: 'my-profile',
    component: MyProfileComponent,
    children: [
      {
        path: 'personal-information',
        component: PersonalInformationComponent,
      },
      {
        path: 'personal-settings',
        component: PersonalSettingsComponent,
      },
      {path: '', redirectTo: 'personal-information', pathMatch: 'full'},
      {path: '**', redirectTo: 'personal-information', pathMatch: 'full'},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalProfileRoutingModule {
}
