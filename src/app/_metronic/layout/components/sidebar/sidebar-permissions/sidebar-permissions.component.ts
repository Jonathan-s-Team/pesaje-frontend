import { Component, Input, OnInit } from '@angular/core';
import { PermissionModel } from 'src/app/modules/auth/models/permission.model';

@Component({
  selector: 'app-sidebar-permissions',
  templateUrl: './sidebar-permissions.component.html',
  styleUrls: ['./sidebar-permissions.component.scss'],
})
export class SidebarPermissionsComponent implements OnInit {
  @Input() menuOptions: PermissionModel[];

  constructor() {}

  ngOnInit(): void {}
}
