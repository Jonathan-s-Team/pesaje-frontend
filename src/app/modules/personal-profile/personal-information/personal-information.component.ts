import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserModel } from '../../auth';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { Permission } from '../../auth/models/permission.model';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
})
export class PersonalInformationComponent implements OnInit {
  isEditing = false;
  user: UserModel | undefined;

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  constructor(
    private userService: UserService,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.user = this.userService.user;
  }

  hasEditPermission(): boolean {
    return this.permissionService.hasPermission(
      'personal-profile/my-profile',
      Permission.EDIT
    );
  }
}
