import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyProfileComponent } from './my-profile/my-profile.component';

const routes: Routes = [
  { path: 'my-profile', component: MyProfileComponent },
  { path: '', redirectTo: 'my-profile', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: 'my-profile', pathMatch: 'full' }, // Catch-all for invalid routes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalProfileRoutingModule {}
