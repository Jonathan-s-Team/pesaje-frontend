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
import {
  IUpdateShrimpFarmModel,
  IReadShrimpFarmModel,
  ICreateShrimpFarmModel,
  TransportationMethodEnum,
} from '../../../interfaces/shrimp-farm.interface';
import { ShrimpFarmService } from '../../../services/shrimp-farm.service';

@Component({
  selector: 'app-shrimp-farm-information',
  templateUrl: './shrimp-farm-information.component.html',
})
export class ShrimpFarmInformationComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  PERMISSION_ROUTE = PERMISSION_ROUTES.CLIENTS;

  isLoading = false;
  private unsubscribe: Subscription[] = [];

  shrimpFarmData: IReadShrimpFarmModel[] = [];
  shrimpFarmInfo: IReadShrimpFarmModel = {} as IReadShrimpFarmModel;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  transportationMethods = Object.values(TransportationMethodEnum);

  @Input() clientId?: string;
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
        render: (data) => `${data}`,
      },
      {
        title: 'Hectareas',
        data: 'numberHectares',
        render: (data) => `${data}`,
      },
      {
        title: 'Lugar',
        data: 'place',
        render: (data) => `${data}`,
      },
      {
        title: 'Metodo de Transporte',
        data: 'transportationMethod',
        render: (data, type, row) =>
          this.getTranslatedTransportationMethod(data).toUpperCase(),
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
    if (!this.clientId) {
      this.route.data.subscribe((data) => {
        this.clientId = data['personId'];
        if (this.clientId) {
          this.loadShrimpFarmInfos();
        }
      });
    } else {
      this.loadShrimpFarmInfos(); // ✅ Load if personId is provided as input
    }
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personId'] && changes['personId'].currentValue) {
      this.loadShrimpFarmInfos(); // Reload when personId changes
    }
  }

  // 🔹 Load Shrimp Farm Info List for Person
  loadShrimpFarmInfos(): void {
    if (!this.clientId) return;

    const paymentSub = this.shrimpFarmService
      .getFarmsByClient(this.clientId)
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
            text: 'No se pudo cargar la camaronera.',
          });
        },
      });
    this.unsubscribe.push(paymentSub);
  }

  // 🔹 Delete a Shrimp Farm Info
  delete(id: string): void {
    const deleteSub = this.shrimpFarmService.deleteShrimpFarm(id).subscribe({
      next: () => {
        this.shrimpFarmData = this.shrimpFarmData.filter(
          (item) => item.id !== id
        );
        this.reloadEvent.emit(true);
      },
      error: () => {
        this.showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la camaronera.',
        });
      },
    });
    this.unsubscribe.push(deleteSub);
  }

  // 🔹 Edit Shrimp Farm Info
  edit(shrimpFarmId: string): void {
    const foundItem = this.shrimpFarmData.find(
      (item) => item.id === shrimpFarmId
    );
    this.shrimpFarmInfo = foundItem
      ? { ...foundItem }
      : ({} as IReadShrimpFarmModel);
  }

  // 🔹 Create a new Shrimp Farm Info
  create(): void {
    this.shrimpFarmInfo = {} as IReadShrimpFarmModel;
  }

  // 🔹 Handle Form Submission
  onSubmit(event: Event, myForm: NgForm): void {
    if (myForm && myForm.invalid) {
      return;
    }

    if (!this.clientId) return;

    this.shrimpFarmInfo.client = this.clientId;

    this.isLoading = true;

    //const isUpdate = !!(this.shrimpFarmInfo as any).id;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: this.shrimpFarmInfo.id
        ? 'Información de camaronera actualizada correctamente.'
        : 'Información de camaronera creada correctamente.',
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
      const updatePayload: IUpdateShrimpFarmModel = { ...this.shrimpFarmInfo };
      console.log(updatePayload);
      this.shrimpFarmService
        .updateShrimpFarm(this.shrimpFarmInfo.id, updatePayload)
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
            errorAlert.text = 'No se pudo actualizar la camaronera.';
            this.showAlert(errorAlert);
            this.isLoading = false;
          },
          complete: completeFn,
        });
    };

    const createFn = () => {
      const createPayload: ICreateShrimpFarmModel = { ...this.shrimpFarmInfo };
      this.shrimpFarmService.createShrimpFarm(createPayload).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.loadShrimpFarmInfos();
        },
        error: (error) => {
          errorAlert.text = 'No se pudo crear la camaronera.';
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

  getTranslatedTransportationMethod(method: TransportationMethodEnum): string {
    const translations: { [key in TransportationMethodEnum]: string } = {
      [TransportationMethodEnum.CAR]: 'Carro',
      [TransportationMethodEnum.CARBOAT]: 'Carro y Bote',
    };
    return translations[method] || method;
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
