import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserModel } from '../../auth';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
})
export class PersonalInformationComponent implements OnInit {
  PERMISSION_ROUTES = PERMISSION_ROUTES;

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
