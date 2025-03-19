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
   * @deprecated This method is deprecated. Use `showErrorAlert({ title, error })` instead.
   */
  showAlert(swalOptions: SweetAlertOptions): void {
    let style = swalOptions.icon?.toString() || 'success';
    let confirmButtonText =
      swalOptions.confirmButtonText?.toString() || 'Aceptar';
    if (swalOptions.icon === 'error') {
      style = 'danger';
      confirmButtonText = 'Entendido';
    }

    Swal.fire({
      ...swalOptions,
      buttonsStyling: false,
      confirmButtonText: confirmButtonText,
      customClass: { confirmButton: 'btn btn-' + style },
    });
  }

  showSuccessAlert({
    title = '¡Éxito!',
    text = 'Los cambios se guardaron correctamente',
  }: {
    title?: string;
    text?: string;
  }): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      timer: 5000,
      timerProgressBar: true,
      buttonsStyling: false,
      confirmButtonText: 'Aceptar',
      customClass: { confirmButton: 'btn btn-success' },
    });
  }

  showErrorAlert({
    title = 'Error',
    error,
  }: {
    title?: string;
    error?: any;
  }): void {
    Swal.fire({
      title: title,
      html: `<strong>${
        error?.message || 'Ocurrió un error inesperado.'
      }</strong>`,
      icon: 'error',
      focusConfirm: false,
      buttonsStyling: false,
      confirmButtonText: 'Entendido',
      customClass: { confirmButton: 'btn btn-danger' },
    });
  }
}
