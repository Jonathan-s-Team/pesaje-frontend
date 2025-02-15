import {Injectable} from "@angular/core";
import {PersonModel} from "../../../shared/models/person.model";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private userSubject = new BehaviorSubject<PersonModel | undefined>(undefined);
  user$ = this.userSubject.asObservable();

  set user(user: PersonModel) {
    this.userSubject.next(user);
  }

  get user(): PersonModel | undefined {
    return this.userSubject.getValue();
  }
}
