import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  /**
   * Show a confirmation alert with custom options.
   * @param options Partial SweetAlert options (optional)
   * @returns A Promise with the result of the confirmation
   */
  confirm(options?: Partial<SweetAlertOptions>): Promise<SweetAlertResult> {
    const defaultOptions: SweetAlertOptions = {
      title: '¿Estás seguro?',
      text: 'Se guardarán los cambios. ¿Deseas continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-active-light',
      },
    };

    return Swal.fire({ ...defaultOptions, ...options });
  }

  /**
   * Show a notification alert (Success, Error, Info, etc.)
   * @param swalOptions Custom SweetAlert options
   */
  showAlert(swalOptions: SweetAlertOptions): void {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }

    Swal.fire({
      ...swalOptions,
      buttonsStyling: false,
      confirmButtonText: 'Ok, got it!',
      customClass: { confirmButton: 'btn btn-' + style },
    });
  }
}
