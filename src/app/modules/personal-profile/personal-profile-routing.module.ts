import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyProfileComponent } from './my-profile.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { PaymentInformationComponent } from './payment-information/payment-information.component';

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
        path: 'payment-information',
        component: PaymentInformationComponent,
      },
      { path: '', redirectTo: 'personal-information', pathMatch: 'full' },
      { path: '**', redirectTo: 'personal-information', pathMatch: 'full' },
    ],
  },
  {
    path: 'broker',
    loadChildren: () => import('./broker/broker.module').then((m) => m.BrokerModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalProfileRoutingModule {}
