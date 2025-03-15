import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePaymentListingComponent } from './purchase-payment-listing.component';

describe('PurchasePaymentListingComponent', () => {
  let component: PurchasePaymentListingComponent;
  let fixture: ComponentFixture<PurchasePaymentListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchasePaymentListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasePaymentListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
