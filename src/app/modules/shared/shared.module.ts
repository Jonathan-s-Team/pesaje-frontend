import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanEditDirective } from '../../directives/can-edit.directive';
import { CanCreateDirective } from '../../directives/can-create.directive';
import { CanDeleteDirective } from '../../directives/can-delete.directive';
import { CanNotEditDirective } from 'src/app/directives/can-not-edit.directive';
import { CanReadDirective } from 'src/app/directives/can-read.directive';

@NgModule({
  declarations: [
    CanEditDirective,
    CanNotEditDirective,
    CanCreateDirective,
    CanDeleteDirective,
    CanReadDirective,
  ],
  imports: [CommonModule],
  exports: [
    CanEditDirective,
    CanNotEditDirective,
    CanCreateDirective,
    CanDeleteDirective,
    CanReadDirective,
  ], // ✅ Export so all modules can use them
})
export class SharedModule {}
