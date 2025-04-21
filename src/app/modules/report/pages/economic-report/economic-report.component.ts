import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  IEconomicReportModel,
  IPurchaseDetailsModel,
} from '../../interfaces/economic-report.interface';
import { ReportService } from '../../services/report.service';
import {
  IReducedDetailedPurchaseModel,
  PurchaseStatusEnum,
} from 'src/app/modules/purchases/interfaces/purchase.interface';
import { DateUtilsService } from 'src/app/utils/date-utils.service';
import { LogisticsTypeEnum } from 'src/app/modules/logistics/interfaces/logistics.interface';
import { AlertService } from 'src/app/utils/alert.service';

@Component({
  selector: 'app-economic-report',
  templateUrl: './economic-report.component.html',
  styleUrl: './economic-report.component.scss',
})
export class EconomicReportComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.REPORTS.ECONOMIC;

  searchSubmitted = false;
  controlNumber: string;

  economicReportModel: IEconomicReportModel;

  purchaseStatus: string;
  logisticsType: string;

  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private reportService: ReportService,
    private dateUtils: DateUtilsService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  loadReportInfo() {
    this.searchSubmitted = true;

    if (!this.controlNumber?.trim()) {
      return; // don't search if input is empty
    }

    const sub = this.reportService
      .getEconomicReportByParams(false, null, null, null, this.controlNumber)
      .subscribe({
        next: (report) => {
          if (!report) {
            this.alertService.showTranslatedAlert({
              alertType: 'info',
              messageKey: 'MESSAGES.PURCHASE_NOT_FOUND',
            });
            return;
          }

          this.economicReportModel = report;

          this.economicReportModel.purchase.purchaseDate =
            this.dateUtils.formatISOToDateInput(
              this.economicReportModel.purchase.purchaseDate
            );

          const statusMap = {
            [PurchaseStatusEnum.DRAFT]: 'Sin pagos',
            [PurchaseStatusEnum.IN_PROGRESS]: 'En progreso',
            [PurchaseStatusEnum.COMPLETED]: 'Completado',
          };
          this.purchaseStatus =
            statusMap[this.economicReportModel.purchase.status];

          this.economicReportModel.sale.saleDate =
            this.dateUtils.formatISOToDateInput(
              this.economicReportModel.sale.saleDate
            );
          this.economicReportModel.sale.receptionDate =
            this.dateUtils.formatISOToDateInput(
              this.economicReportModel.sale.receptionDate
            );

          this.economicReportModel.logistics.logisticsDate =
            this.dateUtils.formatISOToDateInput(
              this.economicReportModel.logistics.logisticsDate
            );

          this.logisticsType =
            this.economicReportModel.logistics.type ===
            LogisticsTypeEnum.SHIPMENT
              ? this.economicReportModel.purchase.companyName === 'Local'
                ? 'Envío Local'
                : 'Envío a Compañía'
              : 'Procesamiento Local';

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
