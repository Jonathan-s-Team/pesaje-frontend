import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MyProfileComponent} from "./my-profile.component";
import {OverviewComponent} from "../profile/overview/overview.component";
import {PersonalInformationComponent} from "./personal-information/personal-information.component";

const routes: Routes = [
  {
    path: 'my-profile',
    component: MyProfileComponent,
    children: [
      {
        path: 'personal-information',
        component: PersonalInformationComponent,
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalProfileRoutingModule {}
