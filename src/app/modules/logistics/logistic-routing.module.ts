import {NewLogisticComponent} from "./new-logistic/new-logistic.component";
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";

const routes: Routes = [
  {
    path: 'new',
    component: NewLogisticComponent,
  },
  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: '**', redirectTo: 'new', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticRoutingModule {}
