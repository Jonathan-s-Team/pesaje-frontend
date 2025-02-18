import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';
import {
  IPermission,
  PermissionEnum,
} from 'src/app/modules/auth/interfaces/permission.interface';

@Injectable({
  providedIn: 'root', // ✅ This makes the service available across the entire app
})
export class PermissionService {
  permissions: IPermission[];

  constructor(private authService: AuthService) {
    this.permissions = this.authService.currentUserValue?.permissions || [];
  }

  /**
   * Checks if the user has a specific action for a given route.
   */
  hasPermission(route: string, action: PermissionEnum): boolean {
    return this.permissions.some((permission) =>
      permission.suboptions?.some(
        (suboption) =>
          suboption.route === route && suboption.actions.includes(action)
      )
    );
  }
}
