import {Component, EventEmitter, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {PERMISSION_ROUTES} from "../../../constants/routes.constants";
import {Config} from "datatables.net";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-payment-listing',
  templateUrl: './payment-listing.component.html',
  styleUrls: ['./payment-listing.component.scss']
})
export class PaymentListingComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.NEW_PURCHASE;

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('paymentsModal') public modalContent: TemplateRef<PaymentListingComponent>;
  private modalRef: NgbModalRef;

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Tipo de Pago',
        data: 'person.identification',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Monto',
        data: 'person.mobilePhone',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Fecha de Pago',
        data: 'person.identification',
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

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void { }

  create() {}
  delete(id: string): void {}
  edit(id: string): void {}
  onSubmitPayment(event: Event, myForm: NgForm) {}

}
