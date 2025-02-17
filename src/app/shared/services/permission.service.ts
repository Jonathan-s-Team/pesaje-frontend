import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';
import {
  Permission,
  PermissionModel,
} from 'src/app/modules/auth/models/permission.model';

@Injectable({
  providedIn: 'root', // ✅ This makes the service available across the entire app
})
export class PermissionService {
  permissions: PermissionModel[];

  constructor(private authService: AuthService) {
    this.permissions = this.authService.currentUserValue?.permissions || [];
  }

  /**
   * Checks if the user has a specific action for a given route.
   */
  hasPermission(route: string, action: Permission): boolean {
    return this.permissions.some((permission) =>
      permission.suboptions?.some(
        (suboption) =>
          suboption.route === route && suboption.actions.includes(action)
      )
    );
  }
}
