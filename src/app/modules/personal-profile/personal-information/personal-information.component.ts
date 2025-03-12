import { Component, OnInit } from '@angular/core';
import { UserModel } from '../../auth';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import { UserService } from '../../settings/services/user.service';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
})
export class PersonalInformationComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PERSONAL_PROFILE.MY_PROFILE;

  isEditing = false;
  user: UserModel | undefined;

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.user;
  }
}
