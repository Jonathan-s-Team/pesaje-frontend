import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from 'src/app/modules/personal-profile/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class PersonIdResolver implements Resolve<string | null> {
  constructor(private userService: UserService) {}

  resolve(): Observable<string | null> {
    return this.userService.user$.pipe(map((user) => user?.person?.id || null));
  }
}
