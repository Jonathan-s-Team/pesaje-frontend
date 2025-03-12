import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService, UserModel } from '../auth';
import { UserService } from '../settings/services/user.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
})
export class MyProfileComponent implements OnInit, OnDestroy {
  user: UserModel | undefined;
  isLoading$: Observable<boolean>;
  private unsubscribe: Subscription[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.isLoading$ = this.userService.isLoading$;
  }

  ngOnInit(): void {
    const userId = this.authService.currentUserValue!.id;

    // Subscribe to userSubject for live updates
    const userSub = this.userService.user$.subscribe((user) => {
      this.user = user;
    });
    this.unsubscribe.push(userSub); // Store the subscription

    // Fetch user only if not already loaded
    if (!this.userService.user) {
      const apiSub = this.userService.getUserById(userId).subscribe();
      this.unsubscribe.push(apiSub);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
