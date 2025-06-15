import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../services/company.service';
import { NgForm } from '@angular/forms';
import { ICompany } from '../../interfaces/company.interfaces';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/utils/alert.service';

@Component({
  selector: 'app-company-list-details',
  templateUrl: './company-list-details.component.html',
  styleUrls: ['./company-list-details.component.scss'],
})
export class CompanyListDetailsComponent implements OnInit {
  companies: ICompany[] = [];
  selectedCompany: ICompany | null = null;

  isLoading$: Observable<boolean>;

  constructor(
    private companyService: CompanyService,
    private alertService: AlertService
  ) {
    this.isLoading$ = this.companyService.isLoading$;
  }

  ngOnInit(): void {
    this.fetchCompanies();
  }

  fetchCompanies() {
    // No need to set isLoading here, handled by the service
    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: () => {
        // Optionally handle error
      },
    });
  }

  selectCompany(company: ICompany) {
    this.selectedCompany = { ...company };
    if (!this.selectedCompany.maxAndMinTideQuotaReceived) {
      this.selectedCompany.maxAndMinTideQuotaReceived = {
        max: 0,
        min: 0,
      };
    }
  }

  onLogisticsPayedChange() {
    if (this.selectedCompany && !this.selectedCompany.isLogisticsPayed) {
      this.selectedCompany.wholeAmountToPay = 0;
      this.selectedCompany.tailAmountToPay = 0;
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        this.companyService
          .updateCompany(this.selectedCompany as ICompany)
          .subscribe({
            next: () => {
              this.alertService.showTranslatedAlert({
                alertType: 'success',
              });
              this.fetchCompanies();
            },
            error: () => {
              this.alertService.showTranslatedAlert({
                alertType: 'error',
              });
            },
          });
      }
    });
  }
}
