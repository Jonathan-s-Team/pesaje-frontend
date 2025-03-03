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
  IUpdatePeriodModel,
} from 'src/app/modules/shared/interfaces/period.interface';
import { PeriodService } from 'src/app/modules/shared/services/period.service';
import {
  IReadSizeModel,
  SizeTypeEnum,
} from 'src/app/modules/shared/interfaces/size.interface';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  ICreateSizePriceModel,
  IReadSizePriceModel,
  IUpdateSizePriceModel,
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
  isEditing = false;
  showEditButton = false;
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

    this.selectedPeriod = '';
    this.resetTableForms();
  }

  onPeriodChange() {
    this.resetTableForms();
  }

  search() {
    if (!this.selectedCompany || !this.selectedPeriod) {
      this.showErrors = true;
      return;
    }

    this.showEditButton = true;
    this.isEditing = false;

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

        if (this.wholeTableComponent) {
          this.wholeTableComponent.disableForm();
        }

        if (this.headlessTableComponent) {
          this.headlessTableComponent.disableForm();
        }

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
    this.showEditButton = false;

    this.resetTableForms();

    this.cdr.detectChanges();
  }

  toggleEditPeriod() {
    this.isEditing = false;

    this.showErrors = false;
    this.showEditButton = true;

    if (this.wholeTableComponent) {
      this.wholeTableComponent.disableForm();
    }

    if (this.headlessTableComponent) {
      this.headlessTableComponent.disableForm();
    }

    this.cdr.detectChanges();
  }

  resetTableForms() {
    if (this.wholeTableComponent) {
      this.wholeTableComponent.clearValidationErrors();
      this.wholeTableComponent.form.reset();
      this.wholeTableComponent.enableForm();
    }

    if (this.headlessTableComponent) {
      this.headlessTableComponent.clearValidationErrors();
      this.headlessTableComponent.form.reset();
      this.headlessTableComponent.enableForm();
    }
  }

  editPeriod() {
    this.isEditing = true;

    if (this.wholeTableComponent) {
      this.wholeTableComponent.enableForm();
    }

    if (this.headlessTableComponent) {
      this.headlessTableComponent.enableForm();
    }

    this.cdr.detectChanges();
  }

  cancelEditing() {
    this.isEditing = false;

    if (this.wholeTableComponent) {
      this.wholeTableComponent.disableForm();
    }

    if (this.headlessTableComponent) {
      this.headlessTableComponent.disableForm();
    }

    this.search();
  }

  savePeriod() {
    if (this.isEditing) {
      this.showErrors = !this.selectedCompany || !this.selectedPeriod;
    } else {
      this.showErrors =
        !this.selectedCompany || !this.selectedMonth || !this.selectedYear;
    }

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

    const periodPayload: IUpdatePeriodModel = {
      sizePrices: [
        ...this.extractSizePrices(this.wholeTableComponent),
        ...this.extractSizePrices(this.headlessTableComponent),
      ],
    };

    if (this.selectedPeriod) {
      // ✅ Update existing period
      const updatePeriodSub = this.periodService
        .updatePaymentInfo(this.selectedPeriod, periodPayload)
        .subscribe({
          next: () => {
            this.showAlert({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Periodo actualizado exitosamente!',
            });
            this.toggleEditPeriod();
          },
          error: () => {
            this.showAlert({
              icon: 'error',
              title: '¡Error!',
              text: 'No se pudo actualizar el periodo.',
            });
          },
        });

      this.unsubscribe.push(updatePeriodSub);
    } else {
      // ✅ Create new period
      const createPeriodSub = this.periodService
        .createPeriod({
          name: `${this.selectedMonth}-${this.selectedYear}`,
          company: this.selectedCompany,
          ...periodPayload,
        })
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
  }

  extractSizePrices(
    component: WholeTableComponent | HeadlessTableComponent
  ): IUpdateSizePriceModel[] {
    if (!component?.sizes || !component.form) return [];

    return component.sizes.map((size) => {
      const controlKey = this.getSizeControlKey(size);
      return {
        sizeId: size.id,
        price: +component.form.value[controlKey] || 0, // Ensure conversion to number
      };
    });
  }

  private getSizeControlKey(size: IReadSizeModel): string {
    switch (size.type) {
      case SizeTypeEnum['TAIL-A']:
        return `cola-a-${size.id}`;
      case SizeTypeEnum['TAIL-A-']:
        return `cola-a--${size.id}`;
      case SizeTypeEnum['TAIL-B']:
        return `cola-b-${size.id}`;
      default:
        return size.id;
    }
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
