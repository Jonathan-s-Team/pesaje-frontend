import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { PersonModel } from '../../../shared/models/person.model';
import { UserModel } from '../../auth';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
})
export class PersonalInformationComponent implements OnInit {
  user: UserModel | undefined;

  constructor(private userService: UserService) {}
  ngOnInit() {
    this.user = this.userService.user;
  }
}
