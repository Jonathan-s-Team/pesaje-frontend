import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Subscription } from 'rxjs';
import { SweetAlertOptions } from 'sweetalert2';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import { IReadCompanyModel } from 'src/app/modules/shared/interfaces/company.interface';
import { CompanyService } from 'src/app/modules/shared/services/company.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WholeTableComponent } from 'src/app/modules/shared/components/prices/whole-table/whole-table.component';
import { HeadlessTableComponent } from 'src/app/modules/shared/components/prices/headless-table/headless-table.component';
import {
  ICreatePeriodModel,
  IReadPeriodModel,
} from 'src/app/modules/shared/interfaces/period.interface';
import { PeriodService } from 'src/app/modules/shared/services/period.service';
import { SizeTypeEnum } from 'src/app/modules/shared/interfaces/size.interface';
import { distinctUntilChanged } from 'rxjs/operators';
import { ICreateSizePriceModel } from 'src/app/modules/shared/interfaces/size-price.interface';

@Component({
  selector: 'app-size-price',
  templateUrl: './size-price.component.html',
})
export class SizePriceComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTES = PERMISSION_ROUTES;

  @ViewChild(WholeTableComponent) wholeTableComponent!: WholeTableComponent;
  @ViewChild(HeadlessTableComponent)
  headlessTableComponent!: HeadlessTableComponent;

  months = [
    { label: 'Enero', value: '01' },
    { label: 'Febrero', value: '02' },
    { label: 'Marzo', value: '03' },
    { label: 'Abril', value: '04' },
    { label: 'Mayo', value: '05' },
    { label: 'Junio', value: '06' },
    { label: 'Julio', value: '07' },
    { label: 'Agosto', value: '08' },
    { label: 'Septiembre', value: '09' },
    { label: 'Octubre', value: '10' },
    { label: 'Noviembre', value: '11' },
    { label: 'Diciembre', value: '12' },
  ];

  years: number[] = [];
  companies: IReadCompanyModel[] = [];
  existingPeriods: IReadPeriodModel[] = [];

  selectedPeriod = '';
  selectedCompany = '';

  isAdding = false;
  showErrors = false;

  periodForm: FormGroup;

  private unsubscribe: Subscription[] = [];

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  constructor(
    private companyService: CompanyService,
    private periodService: PeriodService,
    private cdr: ChangeDetectorRef
  ) {
    this.periodForm = new FormGroup({
      company: new FormControl('', Validators.required),
      month: new FormControl('', Validators.required),
      year: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadYears();
    this.loadCompanies();
  }

  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = {
      ...swalOptions,
      buttonsStyling: false,
      confirmButtonText: 'Ok, got it!',
      customClass: { confirmButton: 'btn btn-' + style },
    };
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  loadYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  }

  loadCompanies(): void {
    const companieSub = this.companyService
      .getCompanies()
      .pipe(distinctUntilChanged())
      .subscribe({
        next: (companies) => (this.companies = companies),
        error: (err) => console.error('Error al cargar compañías', err),
      });

    this.unsubscribe.push(companieSub);
  }

  onCompanyChange() {
    if (!this.selectedCompany) {
      this.existingPeriods = [];
      return;
    }

    // Fetch periods for the selected company
    this.periodService.getPeriodsByCompany(this.selectedCompany).subscribe({
      next: (periods) => {
        this.existingPeriods = periods;
      },
      error: (err) => {
        console.error('Error al cargar periodos:', err);
      },
    });
  }

  search() {
    if (!this.selectedCompany || !this.selectedPeriod) {
      this.showErrors = true;
      return;
    }

    // Call API to fetch period details by ID
    this.periodService.getPeriodById(this.selectedPeriod).subscribe({
      next: (periodDetails) => {
        console.log('Fetched Period Details:', periodDetails);
      },
      error: (err) => {
        console.error('Error al cargar periodo y precios:', err);
      },
    });
  }

  toggleAddPeriod() {
    this.isAdding = !this.isAdding;

    if (!this.isAdding) {
      this.periodForm.reset();
      // Explicitly set the default values
      this.periodForm.patchValue({
        company: '', // Ensures placeholder is selected
        month: '', // Ensures placeholder is selected
        year: '', // Ensures placeholder is selected
      });

      this.selectedPeriod = '';
      this.selectedCompany = '';

      if (this.wholeTableComponent) {
        this.wholeTableComponent.clearValidationErrors();
        this.wholeTableComponent.form.reset();
      }

      if (this.headlessTableComponent) {
        this.headlessTableComponent.clearValidationErrors();
        this.headlessTableComponent.form.reset();
      }
    }
    this.cdr.detectChanges();
  }

  savePeriod() {
    if (this.periodForm.invalid) {
      this.periodForm.markAllAsTouched();
      return;
    }

    let hasErrors = false;

    if (this.wholeTableComponent?.form.invalid) {
      this.wholeTableComponent.triggerValidation();
      hasErrors = true;
    }

    if (this.headlessTableComponent?.form.invalid) {
      this.headlessTableComponent.triggerValidation();
      hasErrors = true;
    }

    if (hasErrors) return;

    let periodPayload: ICreatePeriodModel = {
      name: `${this.periodForm.get('month')?.value}-${
        this.periodForm.get('year')?.value
      }`,
      company: this.periodForm.get('company')?.value,
      sizePrices: [
        ...this.extractSizePrices(this.wholeTableComponent),
        ...this.extractSizePrices(this.headlessTableComponent),
      ],
    };

    const createPeriodSub = this.periodService
      .createPeriod(periodPayload)
      .subscribe({
        next: () => {
          this.showAlert({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Periodo creado exitosamente!',
          });
          this.toggleAddPeriod();
        },
        error: () => {
          this.showAlert({
            icon: 'error',
            title: '¡Error!',
            text: 'No se pudo crear el periodo.',
          });
        },
      });

    this.unsubscribe.push(createPeriodSub);
  }

  extractSizePrices(
    component: WholeTableComponent | HeadlessTableComponent
  ): ICreateSizePriceModel[] {
    if (!component?.sizes || !component.form) return [];

    return component.sizes.map((size) => ({
      sizeId: size.id, // ✅ Explicitly define sizeId
      price: +component.form.value[size.id] || 0, // Convert to number safely
    }));
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
