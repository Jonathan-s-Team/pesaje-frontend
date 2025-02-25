import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrokerService } from '../../services/broker.service';
import { IReadBrokerModel } from '../../interfaces/broker.interface'; // Make sure this path is correct
import { Observable } from 'rxjs';

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-broker-details',
  templateUrl: './broker-details.component.html',
  styleUrls: ['./broker-details.component.scss'],
})
export class BrokerDetailsComponent implements OnInit, AfterViewInit {
  isCollapsed: boolean = false;
  brokerData!: IReadBrokerModel | null; // Broker details object
  personId: string;
  isLoading: boolean = true; // Added loading state

  activeTab: Tabs = 'Details';

  constructor(
    private brokerService: BrokerService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const brokerId = params.get('brokerId');
      if (brokerId) {
        this.fetchBrokerDetails(brokerId);
      }
    });
  }

  fetchBrokerDetails(brokerId: string): void {
    this.isLoading = true; // Start loading
    this.brokerService.getBrokerById(brokerId).subscribe({
      next: (broker) => {
        this.brokerData = broker;
        this.personId = broker.person!.id; // Extract personId from broker data
        this.isLoading = false;
        this.changeDetectorRef.detectChanges(); // Ensure UI updates
      },
      error: (err) => {
        console.error('Error fetching broker details:', err);
        this.brokerData = null;
        this.isLoading = false;
      },
    });
  }

  setActiveTab(tab: Tabs) {
    this.activeTab = tab;
  }

  ngAfterViewInit(): void {}
}
