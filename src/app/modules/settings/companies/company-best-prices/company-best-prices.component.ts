import { Component } from '@angular/core';
import { ICompany } from '../../interfaces/company.interfaces';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { IReadPeriodModel } from 'src/app/modules/shared/interfaces/period.interface';
import { PeriodService } from 'src/app/modules/shared/services/period.service';

@Component({
  selector: 'app-company-best-prices',
  templateUrl: './company-best-prices.component.html',
  styleUrl: './company-best-prices.component.scss'
})
export class CompanyBestPricesComponent {
  periods: string[] = [];
  typeSizeData: any;
  groupedSizes: any;

  selectedCompany: ICompany | null = null;
  selectedCompanyInput = '';
  selectedPeriod = '';

  showErrors = false;

  isLoading$: Observable<boolean>;

  constructor(private companyService: CompanyService, private periodService: PeriodService) {
    this.isLoading$ = this.companyService.isLoading$;
  }

  ngOnInit(): void {
    this.fetchPeriods();
  }

  fetchPeriods() {
    // No need to set isLoading here, handled by the service
    this.periodService.getAllPeriods().subscribe({
      next: (period) => {
        this.periods = period;
      },
      error: () => {
        // Optionally handle error
      },
    });
  }

  onPeriodChange() {
    const sizes = ['']
    this.periodService.getPeriodByName(this.selectedPeriod).subscribe({
      next: (prices) => {
        this.typeSizeData = prices;
        this.groupedSizes = [
          {
            type: 'ENTERO',
            sizes: this.typeSizeData.filter((size: any) => size.type.includes('WHOLE'))
          },
          {
            type: 'SIN CABEZA',
            sizes: this.typeSizeData.filter((size: any) => size.type.includes('TAIL'))
          },
          {
            type: 'RESIDUAL',
            sizes: this.typeSizeData.filter((size: any) => size.type.includes('RESIDUAL'))
          }
        ].filter(group => group.sizes.length > 0); // Eliminar grupos vacíos
      },
      error: () => {
        // Optionally handle error
      },
    });
  }

  search() {

  }

}
