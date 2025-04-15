import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IEconomicReportModel } from '../../interfaces/economic-report.interface';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-economic-report',
  templateUrl: './economic-report.component.html',
  styleUrl: './economic-report.component.scss',
})
export class EconomicReportComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.REPORTS.ECONOMIC;

  controlNumber: string;

  economicReportModel: IEconomicReportModel;

  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  loadReportInfo() {
    const sub = this.reportService
      .getEconomicReportByParams(false, null, null, null, this.controlNumber)
      .subscribe({
        next: (report) => {
          this.economicReportModel = report;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching economic report:', error);
        },
      });

    this.unsubscribe.push(sub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
