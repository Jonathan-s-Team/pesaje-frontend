import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { Config } from 'datatables.net';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import { AuthService } from '../../../auth';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { ISaleModel, SaleTypeEnum } from '../../interfaces/sale.interface';

@Component({
  selector: 'app-recent-sales',
  templateUrl: './recent-sales.component.html',
  styleUrl: './recent-sales.component.scss',
})
export class RecentSalesComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.SALES.RECENT_SALES;

  private unsubscribe: Subscription[] = [];

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  isLoading = false;
  isOnlyBuyer = false;

  salesModel: ISaleModel;
  recentSales: ISaleModel[] = [];

  controlNumber = '';

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Numero de Control',
        data: 'controlNumber',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Tipo',
        data: 'type',
        render: function (data) {
          if (!data) return '-';

          if (data === SaleTypeEnum.COMPANY) return 'Venta a Compañía';

          return 'Venta Local';
        },
      },
      {
        title: 'Fecha de Venta',
        data: 'saleDate',
        render: function (data) {
          if (!data) return '-';
          const date = new Date(data);
          return date.toLocaleDateString('es-ES');
        },
      },
      {
        title: 'Total',
        data: 'total',
        render: function (data) {
          if (!data && data !== 0) return '-';

          const formatted = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data);

          return `$${formatted}`;
        },
      },
      {
        title: 'Comprador',
        data: 'buyer.fullName',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Cliente',
        data: 'client.fullName',
        render: function (data) {
          return data ? data : '-';
        },
      },
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
    },
    createdRow: function (row, data, dataIndex) {
      $('td:eq(0)', row).addClass('d-flex align-items-center');
    },
  };

  constructor(
    private authService: AuthService,
    private saleService: SaleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isOnlyBuyer = this.authService.isOnlyBuyer;
    this.loadRecentSales();
  }

  loadRecentSales() {
    const userId: string | null = this.isOnlyBuyer
      ? this.authService.currentUserValue?.id ?? null
      : null;

    const salesSub = this.saleService
      .getSalesByParams(
        false,
        userId,
        this.controlNumber ? this.controlNumber : null
      )
      .subscribe({
        next: (sales: ISaleModel[]) => {
          this.recentSales = sales;
          this.datatableConfig = {
            ...this.datatableConfig,
            data: [...this.recentSales],
          };
          this.reloadEvent.emit(true);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching sales:', error);
        },
      });
    this.unsubscribe.push(salesSub);
  }

  edit(id: string) {
    const foundItem = this.recentSales.find((item) => item.id === id);
    this.salesModel = foundItem ? { ...foundItem } : ({} as ISaleModel);

    if (this.salesModel.type === SaleTypeEnum.COMPANY) {
      this.router.navigate(['sales', 'company', 'edit', id]);
    } else {
      this.router.navigate(['sales', 'local', 'edit', id]);
    }
  }

  clearFilters() {
    this.controlNumber = '';

    this.loadRecentSales();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
    this.reloadEvent.unsubscribe();
  }
}
