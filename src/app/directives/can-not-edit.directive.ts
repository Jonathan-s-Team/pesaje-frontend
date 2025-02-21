import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../shared/services/permission.service';

@Directive({
  selector: '[appCanNotEdit]',
})
export class CanNotEditDirective {
  private route: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  @Input()
  set appCanNotEdit(route: string) {
    this.route = route;
    this.updateView();
  }

  private updateView() {
    if (!this.permissionService.canEdit(this.route)) {
      this.viewContainer.createEmbeddedView(this.templateRef); // ✅ Show element
    } else {
      this.viewContainer.clear(); // ❌ Hide element
    }
  }
}
