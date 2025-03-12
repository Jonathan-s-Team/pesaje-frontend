import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-payment-listing',
  templateUrl: './payment-listing.component.html',
  styleUrls: ['./payment-listing.component.scss']
})
export class PaymentListingComponent implements OnInit {
  @ViewChild('paymentsModal') private modalContent: TemplateRef<PaymentListingComponent>;
  private modalRef: NgbModalRef;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  open(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.modalContent) {
        this.modalRef = this.modalService.open(this.modalContent);
        this.modalRef.result.then(resolve, resolve);
      } else {
        console.error('Modal content is not initialized');
        resolve(false);
      }
    });
  }

}
