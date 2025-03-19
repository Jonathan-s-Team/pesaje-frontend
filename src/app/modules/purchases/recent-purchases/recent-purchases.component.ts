import {ChangeDetectorRef, Component, EventEmitter, OnInit} from '@angular/core';
import {Config} from "datatables.net";
import {PERMISSION_ROUTES} from "../../../constants/routes.constants";
import {AuthService} from "../../auth";
import {PurchaseService} from "../services/purchase.service";
import {Subscription} from "rxjs";
import {IDetailedPurchaseModel, IListPurchaseModel} from "../interfaces/purchase.interface";

@Component({
  selector: 'app-recent-purchases',
  templateUrl: './recent-purchases.component.html',
  styleUrl: './recent-purchases.component.scss'
})
export class RecentPurchasesComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PERSONAL_PROFILE.BROKERS;

  private unsubscribe: Subscription[] = [];

  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  isLoading = false;
  isOnlyBuyer = false;
  recentPurchases: IListPurchaseModel[] = [];

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Fecha de Compra',
        data: 'purchaseDate',
        render: function (data) {
          if (!data) return '-';
          const date = new Date(data);
          return date.toLocaleDateString('es-ES');
        }
      },
      {
        title: 'Subtotal',
        data: 'subtotal',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Subtotal 2',
        data: 'subtotal2',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Total',
        data: 'grandTotal',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Total Acordado',
        data: 'totalAgreedToPay',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Factura',
        data: 'invoice',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Estado',
        data: 'status',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Numero de Control',
        data: 'controlNumber',
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
    private purchaseService: PurchaseService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isOnlyBuyer = this.authService.isOnlyBuyer;
    this.loadRecentPurchases();
  }

  loadRecentPurchases() {
    const userId: string | null = this.isOnlyBuyer ? this.authService.currentUserValue?.id ?? null : null;

    const purchaseSub = this.purchaseService.getPurchaseByParams(false, userId, null, null).subscribe({
      next: (purchases: IListPurchaseModel[]) => {
        this.recentPurchases = purchases;
        this.datatableConfig = {
          ...this.datatableConfig,
          data: [...this.recentPurchases],
        };
        this.reloadEvent.emit(true);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching purchases:', error);
      },
    });
    this.unsubscribe.push(purchaseSub);
  }

  edit(id: string) { }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
    this.reloadEvent.unsubscribe();
  }

}
