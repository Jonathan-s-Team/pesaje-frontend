import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import {UserModel} from "../../../../../shared/models/user.model";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-personal-profile-details',
  templateUrl: './personal-profile-details.component.html',
})
export class PersonalProfileDetailsComponent implements OnInit, OnDestroy {
  user: UserModel | undefined = undefined;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  constructor(private cdr: ChangeDetectorRef, private userService: UserService) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    const userSub = this.userService.user$.subscribe(user => {
      this.user = user;
    });
    this.unsubscribe.push(userSub);
  }

  saveSettings() {
    this.isLoading$.next(true);
    setTimeout(() => {
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1500);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
