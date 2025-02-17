import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserModel } from '../../auth';

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

  constructor(private userService: UserService) {}
  ngOnInit() {
    this.user = this.userService.user;
  }
}
