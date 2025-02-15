import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {UserService} from "./services/user.service";
import {UserModel} from "../../shared/models/user.model";

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html'
})

export class MyProfileComponent implements OnInit, OnDestroy {
  user: UserModel | undefined;
  private unsubscribe: Subscription[] = [];

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.user = {
      person: "65b1234567890abcdef12345",
      names: "Jonathan",
      lastNames: "Pillajo",
      password: "hashedpassword",
      roles: [
        {_id: "65c1234567890abcdef67890", name: "Admin"},
        {_id: "65c9876543210abcdef12345", name: "Developer"}
      ],
      brokers: ["65d1234567890abcdef54321"],
      deletedAt: null,
      company: "Test Company",
      phone: "090000000",
      companySite: "jpillajo@test.com",
      country: "ecuador",
      communication: "Email, Teléfono",
      allowChanges: true
    };

    this.userService.user = this.user;
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }
}
