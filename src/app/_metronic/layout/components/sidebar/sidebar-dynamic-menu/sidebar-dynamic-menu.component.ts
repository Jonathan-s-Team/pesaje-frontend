import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPermissionModel } from 'src/app/modules/auth/interfaces/permission.interface';

@Component({
  selector: 'app-sidebar-dynamic-menu',
  templateUrl: './sidebar-dynamic-menu.component.html',
  styleUrls: ['./sidebar-dynamic-menu.component.scss'],
})
export class SidebarDynamicMenuComponent implements OnInit {
  @Input() menuOptions: IPermissionModel[];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  isOptionActive(option: IPermissionModel): boolean {
    return !!option.route && this.router.url === '/' + option.route;
  }
}
