import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { PersonalProfileRoutingModule } from './personal-profile-routing.module';

@NgModule({
  declarations: [MyProfileComponent],
  imports: [CommonModule, PersonalProfileRoutingModule],
})
export class PersonalProfileModule {}
