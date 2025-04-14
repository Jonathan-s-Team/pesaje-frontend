import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import { InputUtilsService } from 'src/app/utils/input-utils.service';
import { FormUtilsService } from 'src/app/utils/form-utils.service';
import { ILogisticsItemModel } from 'src/app/modules/logistics/interfaces/logistics-item.interface';
import { Config } from 'datatables.net';
import {
  CompanySaleStyleEnum,
  ICreateUpdateCompanySaleItemModel,
} from '../../interfaces/company-sale-item.interface';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-company-sale-items-listing',
  templateUrl: './company-sale-items-listing.component.html',
  styleUrl: './company-sale-items-listing.component.scss',
})
export class CompanySaleItemsListingComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.SALES.NEW_COMPANY;

  @Input() title: string = '';

  @Output() logisticsItemsChange = new EventEmitter<ILogisticsItemModel[]>();

  @ViewChild('myForm') myForm!: NgForm;

  private unsubscribe: Subscription[] = [];

  isLoading = false;

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  companySaleItem: ICreateUpdateCompanySaleItemModel =
    {} as ICreateUpdateCompanySaleItemModel;

  companySaleItems: ICreateUpdateCompanySaleItemModel[] = [];

  companySaleStyles: CompanySaleStyleEnum[];
  companySaleStylesLabels: { [key in CompanySaleStyleEnum]?: string } = {};

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [], // ✅ Ensure default is an empty array
    columns: [
      {
        title: 'Estilo',
        data: 'style',
      },
      {
        title: 'Clase',
        data: 'class',
      },
      {
        title: 'Talla',
        data: 'size',
      },
      {
        title: 'Libras (lb)',
        data: 'pounds',
        render: function (data) {
          if (!data && data !== 0) return '-';

          const formatted = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data);

          return `${formatted}`;
        },
      },
      {
        title: 'Precio Referencial($)',
        data: 'referencePrice',
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
        title: 'Precio ($)',
        data: 'price',
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
        title: 'Total ($)',
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
        title: '%',
        data: 'percentage',
        render: function (data) {
          if (!data && data !== 0) return '-';

          const formatted = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data);

          return `${formatted}%`;
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
    private inputUtils: InputUtilsService,
    private formUtils: FormUtilsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.companySaleStylesLabels = {
      [CompanySaleStyleEnum.WHOLE]: 'Entero',
      [CompanySaleStyleEnum.TAIL]: 'Cola',
    };
    this.companySaleStyles = Object.values(CompanySaleStyleEnum);
  }

  onSubmit(event: Event, myForm: NgForm): void {
    if (myForm?.invalid) return;

    this.isLoading = true;

    const complete = () => {
      this.isLoading = false;
    };

    const updateDatatableAndNotify = () => {
      const totalSum = this.companySaleItems.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );

      this.companySaleItems = this.companySaleItems.map((item) => ({
        ...item,
        percentage:
          totalSum > 0 ? (Number(item.total || 0) / totalSum) * 100 : 0,
      }));

      this.datatableConfig = {
        ...this.datatableConfig,
        data: [...this.companySaleItems],
      };

      this.cdr.detectChanges();
      this.reloadEvent.emit(true);
      complete();
    };

    if (this.companySaleItem.id) {
      // Update existing item
      const index = this.companySaleItems.findIndex(
        (item) => item.id === this.companySaleItem.id
      );

      if (index > -1) {
        this.companySaleItems[index] = { ...this.companySaleItem }; // Ensure copy
      }

      updateDatatableAndNotify();
    } else {
      // Create new item
      this.companySaleItem.id = uuidv4();
      this.companySaleItems.push({ ...this.companySaleItem });

      updateDatatableAndNotify();
    }
  }

  create() {
    this.companySaleItem = {} as ICreateUpdateCompanySaleItemModel;
  }

  delete(id: string): void {
    this.companySaleItems = this.companySaleItems.filter(
      (item) => item.id !== id
    );

    this.datatableConfig = {
      ...this.datatableConfig,
      data: [...this.companySaleItems],
    };

    this.cdr.detectChanges();
    this.reloadEvent.emit(true);
  }

  edit(id: string): void {
    const foundItem = this.companySaleItems.find((item) => item.id === id);
    this.companySaleItem =
      foundItem ?? ({} as ICreateUpdateCompanySaleItemModel);
  }

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event);
  }

  formatDecimal(controlName: string) {
    const control = this.myForm.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control); // ✅ Use utility function
      this.onInputChange();
    }
  }

  onInputChange(): void {
    const pounds = Number(this.companySaleItem.pounds) || 0;
    const price = Number(this.companySaleItem.price) || 0;
    this.companySaleItem.total = pounds * price;
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
    this.reloadEvent.unsubscribe();
  }
}
