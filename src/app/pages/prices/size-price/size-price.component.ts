import {
  ChangeDetectorRef,
  Component,
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
import { WholeTableComponent } from 'src/app/modules/shared/components/prices/whole-table/whole-table.component';
import { HeadlessTableComponent } from 'src/app/modules/shared/components/prices/headless-table/headless-table.component';
import {
  ICreatePeriodModel,
  IReadPeriodModel,
} from 'src/app/modules/shared/interfaces/period.interface';
import { PeriodService } from 'src/app/modules/shared/services/period.service';
import { SizeTypeEnum } from 'src/app/modules/shared/interfaces/size.interface';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  ICreateSizePriceModel,
  IReadSizePriceModel,
} from 'src/app/modules/shared/interfaces/size-price.interface';

@Component({
  selector: 'app-size-price',
  templateUrl: './size-price.component.html',
})
export class SizePriceComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTES = PERMISSION_ROUTES;

  @ViewChild(WholeTableComponent) wholeTableComponent!: WholeTableComponent;
  @ViewChild(HeadlessTableComponent)
  headlessTableComponent!: HeadlessTableComponent;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

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
  selectedMonth = '';
  selectedYear = '';

  isAdding = false;
  showErrors = false;

  wholeSizePrices: IReadSizePriceModel[] = [];
  headlessSizePrices: IReadSizePriceModel[] = [];

  private unsubscribe: Subscription[] = [];

  constructor(
    private companyService: CompanyService,
    private periodService: PeriodService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadYears();
    this.loadCompanies();
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
        this.wholeSizePrices = [
          ...(periodDetails.sizePrices?.filter(
            (item) => item.size.type === SizeTypeEnum.WHOLE
          ) || []),
        ];

        this.headlessSizePrices = [
          ...(periodDetails.sizePrices?.filter(
            (item) => item.size.type !== SizeTypeEnum.WHOLE
          ) || []),
        ];

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar periodo y precios:', err);
      },
    });
  }

  toggleAddPeriod() {
    this.isAdding = !this.isAdding;

    this.selectedCompany = '';
    this.selectedMonth = '';
    this.selectedYear = '';
    this.selectedPeriod = '';
    this.showErrors = false;

    if (this.wholeTableComponent) {
      this.wholeTableComponent.clearValidationErrors();
      this.wholeTableComponent.form.reset();
    }

    if (this.headlessTableComponent) {
      this.headlessTableComponent.clearValidationErrors();
      this.headlessTableComponent.form.reset();
    }

    this.cdr.detectChanges();
  }

  savePeriod() {
    // ✅ Show validation errors for missing dropdown values
    this.showErrors =
      !this.selectedCompany || !this.selectedMonth || !this.selectedYear;

    // ✅ Trigger form validation checks
    const hasErrors =
      this.wholeTableComponent?.form.invalid ||
      this.headlessTableComponent?.form.invalid;

    if (this.wholeTableComponent?.form.invalid) {
      this.wholeTableComponent.triggerValidation();
    }

    if (this.headlessTableComponent?.form.invalid) {
      this.headlessTableComponent.triggerValidation();
    }

    // ✅ Stop execution if any validation errors exist
    if (this.showErrors || hasErrors) return;

    // ✅ Create period payload
    const periodPayload: ICreatePeriodModel = {
      name: `${this.selectedMonth}-${this.selectedYear}`,
      company: this.selectedCompany,
      sizePrices: [
        ...this.extractSizePrices(this.wholeTableComponent),
        ...this.extractSizePrices(this.headlessTableComponent),
      ],
    };

    // ✅ Call API
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

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
