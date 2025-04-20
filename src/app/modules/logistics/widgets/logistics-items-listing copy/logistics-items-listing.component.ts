import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Config } from 'datatables.net';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import { ILogisticsCategoryModel } from '../../../shared/interfaces/logistic-type.interface';
import { FormUtilsService } from '../../../../utils/form-utils.service';
import { InputUtilsService } from '../../../../utils/input-utils.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ILogisticsItemModel } from '../../interfaces/logistics-item.interface';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-logistics-items-listing',
  templateUrl: './logistics-items-listing.component.html',
  styleUrl: './logistics-items-listing.component.scss',
})
export class LogisticsItemsListingComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.LOGISTICS.LOGISTICS_FORM;

  @Input() title: string = '';
  @Input() hasDescription: boolean = false;
  @Input() logisticsCategoryList: ILogisticsCategoryModel[];

  @ViewChild('myForm') myForm: NgForm;

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  logisticsItemModel: ILogisticsItemModel;
  logisticsItems: ILogisticsItemModel[] = [];

  allLogisticsCategories: ILogisticsCategoryModel[] = [];

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: this.title,
        data: 'logisticsCategory',
        render: function (data) {
          return data ? data.name : '-';
        },
      },
      {
        title: 'Unidades',
        data: 'unit',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Costo',
        data: 'cost',
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
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
    },
    createdRow: function (row, data, dataIndex) {
      $('td:eq(0)', row).addClass('d-flex align-items-center');
    },
  };

  constructor(
    public activeModal: NgbActiveModal,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.hasDescription) {
      this.datatableConfig.columns!.push({
        title: 'Descripción',
        data: 'description',
        render: function (data) {
          return data ? data : '-';
        },
      });
    }

    this.allLogisticsCategories = [...this.logisticsCategoryList];
  }

  create() {
    this.logisticsItemModel = {} as ILogisticsItemModel;
    this.logisticsItemModel.id = uuidv4();
  }

  edit(id: string): void {
    const foundItem = this.logisticsItems.find((item) => item.id === id);
    this.logisticsItemModel = foundItem ?? ({} as ILogisticsItemModel);

    if (this.logisticsItemModel?.logisticsCategory?.id) {
      this.logisticsItemModel.logisticsCategory =
        this.logisticsCategoryList.find(
          (x) => x.id === this.logisticsItemModel.logisticsCategory.id
        )!;
    }
  }

  delete(id: string): void {
    this.logisticsItems = this.logisticsItems.filter((item) => item.id !== id);

    // this.datatableConfig = {
    //   ...this.datatableConfig,
    //   data: [...this.personnellogisticsItems],
    // };
    this.reloadEvent.emit(true);
    this.updateAvailableCategories();
    // this.cdr.detectChanges();
  }

  onSubmit(event: Event, myForm: NgForm): void {
    if (myForm && myForm.invalid) {
      return;
    }

    const index = this.logisticsItems.findIndex(
      (item) => item.id === this.logisticsItemModel.id
    );

    if (index > -1) {
      // If item exists, update it
      this.logisticsItems[index] = { ...this.logisticsItemModel };
    } else {
      this.logisticsItems.push({ ...this.logisticsItemModel });
    }
    this.datatableConfig = {
      ...this.datatableConfig,
      data: [...this.logisticsItems],
    };

    this.cdr.detectChanges();
    this.reloadEvent.emit(true);
    this.updateAvailableCategories();
  }

  formatDecimal(controlName: string) {
    const control = this.myForm.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control);
    }
  }

  calculateTotal(): void {
    const unit = Number(this.logisticsItemModel.unit || 0);
    const cost = Number(this.logisticsItemModel.cost || 0);
    this.logisticsItemModel.total = unit * cost;
    this.myForm.controls.total?.setValue(this.logisticsItemModel.total);
    this.formatDecimal('total');
  }

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event);
  }

  validateWholeNumber(event: KeyboardEvent) {
    this.inputUtils.validateWholeNumber(event);
  }

  private updateAvailableCategories(): void {
    const usedCategoryIds = this.logisticsItems.map(
      (item) => item.logisticsCategory.id
    );

    this.logisticsCategoryList = this.allLogisticsCategories.filter(
      (category) => !usedCategoryIds.includes(category.id)
    );
  }
}
