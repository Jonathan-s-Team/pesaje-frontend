import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentListingComponent } from './payment-listing.component';

describe('PaymentListingComponent', () => {
  let component: PaymentListingComponent;
  let fixture: ComponentFixture<PaymentListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
