import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import { IReadCompanyModel } from 'src/app/modules/shared/interfaces/company.interface';
import { CompanyService } from 'src/app/modules/shared/services/company.service';
import { WholeTableComponent } from 'src/app/modules/shared/components/prices/whole-table/whole-table.component';
import { HeadlessTableComponent } from 'src/app/modules/shared/components/prices/headless-table/headless-table.component';
import {
  IReadPeriodModel,
  IUpdatePeriodModel,
  TimeOfDayEnum,
} from 'src/app/modules/shared/interfaces/period.interface';
import { PeriodService } from 'src/app/modules/shared/services/period.service';
import {
  IReadSizeModel,
  SizeTypeEnum,
} from 'src/app/modules/shared/interfaces/size.interface';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  IReadSizePriceModel,
  IUpdateSizePriceModel,
} from 'src/app/modules/shared/interfaces/size-price.interface';
import { AlertService } from 'src/app/utils/alert.service';
import { InputUtilsService } from 'src/app/utils/input-utils.service';
import { DateUtilsService } from 'src/app/utils/date-utils.service';

@Component({
  selector: 'app-size-price',
  templateUrl: './size-price.component.html',
})
export class SizePriceComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PRICES;

  @ViewChild(WholeTableComponent) wholeTableComponent!: WholeTableComponent;
  @ViewChild(HeadlessTableComponent)
  headlessTableComponent!: HeadlessTableComponent;

  years: number[] = [];
  companies: IReadCompanyModel[] = [];
  existingPeriods: IReadPeriodModel[] = [];

  selectedPeriod = '';
  selectedCompany = '';
  selectedYear = '';
  periodNumber = '';

  fromDate: string = '';
  timeOfDay: TimeOfDayEnum | '';
  receivedDate: string = '';
  receivedTime: string = '';

  isAdding = false;
  isEditing = false;
  isSearching = false;
  showEditButton = false;
  showErrors = false;

  wholeSizePrices: IReadSizePriceModel[] = [];
  headlessSizePrices: IReadSizePriceModel[] = [];

  private unsubscribe: Subscription[] = [];

  constructor(
    private companyService: CompanyService,
    private periodService: PeriodService,
    private alertService: AlertService,
    private inputUtils: InputUtilsService,
    private dateUtils: DateUtilsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadYears();
    this.loadCompanies();
  }

  loadYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  }

  loadCompanies(): void {
    const companieSub = this.companyService
      .getCompanies()
      .pipe(distinctUntilChanged())
      .subscribe({
        next: (companies) =>
          (this.companies = companies.filter((c) => c.name !== 'Local')),
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
    this.isSearching = true;

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

        const { date, time } = this.dateUtils.parseISODateTime(
          periodDetails.receivedDateTime
        );
        this.receivedDate = date;
        this.receivedTime = time;

        this.fromDate = this.dateUtils.formatISOToDateInput(
          periodDetails.fromDate
        );
        this.timeOfDay = periodDetails.timeOfDay;

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
    this.selectedYear = '';
    this.selectedPeriod = '';
    this.receivedDate = '';
    this.receivedTime = '';
    this.fromDate = '';
    this.timeOfDay = '';
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
    const periodPayload: IUpdatePeriodModel = {
      receivedDateTime: this.dateUtils.toISODateTime(
        this.receivedDate,
        this.receivedTime
      ),
      fromDate: this.dateUtils.convertLocalDateToUTC(this.fromDate),
      timeOfDay: this.timeOfDay as TimeOfDayEnum,
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
            this.alertService.showTranslatedAlert({ alertType: 'success' });
            this.toggleEditPeriod();
          },
          error: () => {
            this.alertService.showTranslatedAlert({ alertType: 'error' });
          },
        });

      this.unsubscribe.push(updatePeriodSub);
    } else {
      // ✅ Create new period
      const createPeriodSub = this.periodService
        .createPeriod({
          name: `${this.periodNumber}/${this.selectedYear}`,
          company: this.selectedCompany,
          ...periodPayload,
        })
        .subscribe({
          next: () => {
            this.alertService.showTranslatedAlert({ alertType: 'success' });
            this.toggleAddPeriod();
          },
          error: () => {
            this.alertService.showTranslatedAlert({ alertType: 'error' });
          },
        });

      this.unsubscribe.push(createPeriodSub);
    }
  }

  confirmSave() {
    this.isSearching = false;

    if (this.isEditing) {
      this.showErrors =
        !this.selectedCompany ||
        !this.selectedPeriod ||
        !this.receivedDate ||
        !this.receivedTime ||
        !this.fromDate ||
        !this.timeOfDay;
    } else {
      this.showErrors =
        !this.selectedCompany ||
        !this.selectedYear ||
        !this.periodNumber ||
        !this.receivedDate ||
        !this.receivedTime ||
        !this.fromDate ||
        !this.timeOfDay;
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

    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        this.savePeriod();
      }
    });
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

  /**
   * 👉 Validates numeric input (prevents invalid characters)
   */
  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event); // ✅ Use utility function
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

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
