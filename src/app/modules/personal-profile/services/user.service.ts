import {Injectable} from "@angular/core";
import {UserModel} from "../../../shared/models/user.model";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private userSubject = new BehaviorSubject<UserModel | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  set user(user: UserModel) {
    this.userSubject.next(user);
  }

  get user(): UserModel | undefined {
    return this.userSubject.getValue();
  }
}
