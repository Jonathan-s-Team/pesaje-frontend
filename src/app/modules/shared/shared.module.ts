import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanEditDirective } from '../../directives/can-edit.directive';
import { CanCreateDirective } from '../../directives/can-create.directive';
import { CanDeleteDirective } from '../../directives/can-delete.directive';
import { CanNotEditDirective } from 'src/app/directives/can-not-edit.directive';

@NgModule({
  declarations: [
    CanEditDirective,
    CanNotEditDirective,
    CanCreateDirective,
    CanDeleteDirective,
  ],
  imports: [CommonModule],
  exports: [
    CanEditDirective,
    CanNotEditDirective,
    CanCreateDirective,
    CanDeleteDirective,
  ], // ✅ Export so all modules can use them
})
export class SharedModule {}
