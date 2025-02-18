import { Component, Input, OnInit } from '@angular/core';
import { IPermission } from 'src/app/modules/auth/interfaces/permission.interface';

@Component({
  selector: 'app-sidebar-permissions',
  templateUrl: './sidebar-permissions.component.html',
  styleUrls: ['./sidebar-permissions.component.scss'],
})
export class SidebarPermissionsComponent implements OnInit {
  @Input() menuOptions: IPermission[];

  constructor() {}

  ngOnInit(): void {}
}
