import {Component, Input, OnInit} from "@angular/core";
import {UserService} from "../services/user.service";
import {PersonModel} from "../../../shared/models/person.model";

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
})
export class PersonalInformationComponent implements OnInit {
  user: PersonModel | undefined;

  constructor(private userService: UserService,) {
  }
  ngOnInit() {
    this.user = this.userService.user;
  }
}
