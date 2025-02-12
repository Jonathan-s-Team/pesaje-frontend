import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService, UserModel} from "../auth";
import {Subscription} from "rxjs";

interface UserModelMock {
  person: string;
  username: string;
  password: string;
  roles: { _id: string; name: string }[];
  brokers?: string[];
  deletedAt?: Date | null;
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html'
})

export class MyProfileComponent implements OnInit, OnDestroy {
  user: UserModelMock | undefined;
  private unsubscribe: Subscription[] = [];

  constructor() {
  }

  ngOnInit(): void {
    // Mock de datos hasta que esté disponible el servicio real
    this.user = {
      person: "65b1234567890abcdef12345",
      username: "Test User Name",
      password: "hashedpassword",
      roles: [
        {_id: "65c1234567890abcdef67890", name: "Admin"},
        {_id: "65c9876543210abcdef12345", name: "Developer"}
      ],
      brokers: ["65d1234567890abcdef54321"],
      deletedAt: null
    };
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }
}
