import {Injectable} from "@angular/core";
import {UserModel} from "../../../shared/models/user.model";

@Injectable({
  providedIn: 'root'
})

export class UserService {
  user: UserModel | undefined;
}
