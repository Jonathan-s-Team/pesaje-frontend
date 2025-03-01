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

@Component({
  selector: 'app-size-price',
  templateUrl: './size-price.component.html',
})
export class SizePriceComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTES = PERMISSION_ROUTES;

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

  selectedMonth = '';
  selectedYear = '';
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
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  loadYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  }

  loadCompanies(): void {
    const companieSub = this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (err) => {
        console.error('Error al cargar companias', err);
      },
    });

    this.unsubscribe.push(companieSub);
  }

  search() {
    // Validate dropdown selections
    if (!this.selectedCompany || !this.selectedMonth || !this.selectedYear) {
      this.showErrors = true;
      return;
    }

    // Proceed with search if valid
    console.log('Searching with:', {
      company: this.selectedCompany,
      month: this.selectedMonth,
      year: this.selectedYear,
    });
  }

  toggleAddPeriod() {
    this.isAdding = !this.isAdding;
    if (!this.isAdding) {
      // Reset form fields when canceling
      this.selectedMonth = '';
      this.selectedYear = '';
      this.selectedCompany = '';
    }
  }

  savePeriod() {
    if (this.periodForm.invalid) {
      this.periodForm.markAllAsTouched(); // Mark all fields as touched to show validation messages
      return;
    }

    console.log('Saving Period:', this.periodForm.value);

    // TODO: Add API call to save period

    // this.toggleAddPeriod(); // Hide the form after saving
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
