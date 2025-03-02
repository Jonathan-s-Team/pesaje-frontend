import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Subscription } from 'rxjs';
import { SweetAlertOptions } from 'sweetalert2';
import { Config } from 'datatables.net';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import { ActivatedRoute } from '@angular/router';
import {IReadShrimpFarmModel} from "../../../interfaces/shrimp-farm.interface";
import {ShrimpFarmService} from "../../../services/shrimp-farm.service";

@Component({
  selector: 'app-shrimp-farm-information',
  templateUrl: './shrimp-farm-information.component.html',
})
export class ShrimpFarmInformationComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  PERMISSION_ROUTES = PERMISSION_ROUTES;

  isLoading = false;
  private unsubscribe: Subscription[] = [];

  shrimpFarmData: IReadShrimpFarmModel[] = [];
  shrimpFarmInfo: IReadShrimpFarmModel = {} as IReadShrimpFarmModel;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  @Input() personId?: string;
  @ViewChild('noticeSwal') noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [], // ✅ Ensure default is an empty array
    columns: [
      {
        title: 'ID',
        data: 'id',
        visible: false,
      },
      {
        title: 'Identificador',
        data: 'identifier',
        render: (data) => `${data?.toUpperCase()}`,
      },
      {
        title: 'Hectareas',
        data: 'numberHectares',
        render: (data) => `${data?.toUpperCase()}`,
      },
      {
        title: 'Lugar',
        data: 'place',
        render: (data) => `${data?.toUpperCase()}`,
      },
      {
        title: 'Metodo de Transporte',
        data: 'transportationMethod',
        render: (data) => `${data?.toUpperCase()}`,
      },
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
    },
  };

  constructor(
    private shrimpFarmService: ShrimpFarmService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // If personId is not provided as an input, get it from route resolver
    if (!this.personId) {
      this.route.data.subscribe((data) => {
        this.personId = data['personId'];
        if (this.personId) {
          this.loadPaymentInfos();
        }
      });
    } else {
      this.loadPaymentInfos(); // ✅ Load if personId is provided as input
    }
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personId'] && changes['personId'].currentValue) {
      this.loadPaymentInfos(); // Reload when personId changes
    }
  }

  // 🔹 Load Payment Info List for Person
  loadPaymentInfos(): void {
    if (!this.personId) return;

    const paymentSub = this.shrimpFarmService
      .getFarmsByClient(this.personId)
      .subscribe({
        next: (data) => {
          this.shrimpFarmData = data;
          this.datatableConfig = {
            ...this.datatableConfig,
            data: [...this.shrimpFarmData],
          };

          this.cdr.detectChanges();
          this.reloadEvent.emit(true);
        },
        error: () => {
          this.showAlert({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información de pago.',
          });
        },
      });
    this.unsubscribe.push(paymentSub);
  }

  // 🔹 Delete a Payment Info
  delete(id: string): void {
    const deleteSub = this.shrimpFarmService.deleteShrimpFarm(id).subscribe({
      next: () => {
        this.shrimpFarmData = this.shrimpFarmData.filter((item) => item.id !== id);
        this.reloadEvent.emit(true);
      },
      error: () => {
        this.showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la información de pago.',
        });
      },
    });
    this.unsubscribe.push(deleteSub);
  }

  // 🔹 Edit Payment Info
  edit(id: string): void {
    const foundItem = this.shrimpFarmData.find((item) => item.id === id);
    this.shrimpFarmInfo = foundItem ? { ...foundItem } : ({} as IReadShrimpFarmModel);
  }

  // 🔹 Create a new Payment Info
  create(): void {
    this.shrimpFarmInfo = {} as IReadShrimpFarmModel;
  }

  // 🔹 Handle Form Submission
  onSubmit(event: Event, myForm: NgForm): void {
    if (myForm && myForm.invalid) {
      return;
    }

    if (!this.personId) return;

    this.shrimpFarmInfo.id = this.personId;

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: this.shrimpFarmInfo.id
        ? 'Información de pago actualizada correctamente.'
        : 'Información de pago creada correctamente.',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error',
      text: '',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const updateFn = () => {
      this.shrimpFarmService
        .updateShrimpFarm(this.shrimpFarmInfo.id, this.shrimpFarmInfo)
        .subscribe({
          next: (updatedInfo) => {
            const index = this.shrimpFarmData.findIndex(
              (item) => item.id === updatedInfo.id
            );
            if (index > -1) this.shrimpFarmData[index] = { ...updatedInfo };

            this.showAlert(successAlert);

            this.datatableConfig = {
              ...this.datatableConfig,
              data: [...this.shrimpFarmData],
            };

            this.cdr.detectChanges();
            this.reloadEvent.emit(true);
          },
          error: (error) => {
            errorAlert.text = 'No se pudo actualizar la información de pago.';
            this.showAlert(errorAlert);
            this.isLoading = false;
          },
          complete: completeFn,
        });
    };

    const createFn = () => {
      this.shrimpFarmService.createShrimpFarm(this.shrimpFarmInfo).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.loadPaymentInfos(); // ✅ Reload the list after creation
        },
        error: (error) => {
          errorAlert.text = 'No se pudo crear la información de pago.';
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    if (this.shrimpFarmInfo.id) {
      updateFn();
    } else {
      createFn();
    }
  }

  // 🔹 Show SweetAlert Message
  showAlert(swalOptions: SweetAlertOptions): void {
    this.swalOptions = {
      buttonsStyling: false,
      confirmButtonText: 'Ok, entendido!',
      customClass: {
        confirmButton:
          'btn btn-' + (swalOptions.icon === 'error' ? 'danger' : 'primary'),
      },
      ...swalOptions,
    };
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
