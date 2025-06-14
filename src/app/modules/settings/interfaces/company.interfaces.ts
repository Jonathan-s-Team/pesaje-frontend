export interface ICompany {
  id?: string;
  name: string;
  code?: string;
  address?: string;
  city: string;
  mainTelephone: string;
  invoiceEmail?: string;

  mainPersonName: string;
  managerName?: string;
  managerCellPhone?: string;
  managerEmail?: string;
  commercialAdvisorName?: string;
  commercialAdvisorCellPhone?: string;
  commercialAdvisorEmail?: string;
  aditionalStaffName?: string;
  positionInCompany?: string;
  aditionalStaffCellPhone?: string;
  aditionalStaffEmail?: string;

  priceListByEmail?: boolean;
  priceListByMessagesOrWhatsApp?: boolean;
  receivesWholeShrimp?: boolean;
  receivesShrimpTails?: boolean;
  maxFlavorPercentReceived?: number;
  maxMoultingAndSoftnessPercentReceived?: number;
  avgWholeShrimpPackagingWeight?: number;
  avgShrimpTailPackagingWeight?: number;
  maxLightFlavorPercentAllowedInWholeShrimp?: number;
  maxAndMinTideQuotaReceived?: {
    max?: number;
    min?: number;
  };

  paymentMethod1?: string;
  paymentMethod2?: string;
  bank1?: string;
  bank2?: string;
  firstPaymentPercent?: number;
  daysUntilFirstPayment?: number;
  secondPaymentPercent?: number;
  daysUntilSecondPayment?: number;
  thirdPaymentPercent?: number;
  daysUntilThirdPayment?: number;
  paymentReliabilityPercent?: number;

  logisticsShippingAvailable?: boolean;
  logisticsCompensationWhole?: number;
  logisticsCompensationTails?: number;
  minimumQuantityReceivedLb?: number;
  custodyCovered?: boolean;
  fishingInsuranceCovered?: boolean;
  companyClassifierKnown?: boolean;
  personCanBeSentForClassification?: boolean;
  extraInformation?: string;

  classificationQuality?: ['BAD', 'GOOD', 'EXCELLENT'];
  arePaymentsOnTime?: boolean;
  observation1?: string;
  observation2?: string;
  observation3?: string;
  observation4?: string;

  isLogisticsSent?: boolean;
  isLogisticsPayed?: boolean;
  wholeAmountToPay?: number;
  tailAmountToPay?: number;

  deletedAt?: Date;
}
