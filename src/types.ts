export type DocumentType =
  | "quotation"
  | "proforma"
  | "commercial"
  | "packing"
  | "contract"
  | "ams"
  | "isf"
  | "vgm"
  | "si";
export type DocumentStatus = "draft" | "completed" | "archived";
export type LanguageCode = "zh-CN" | "en" | "es" | "fr" | "de" | "ru" | "ar" | "pt" | "ja" | "ko" | "vi";

export interface Company {
  nameZh: string;
  nameEn: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  registration: string;
  bankName: string;
  bankAccount: string;
  swift: string;
  bankAddress: string;
  logo?: string;
  stamp?: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  country: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  registration: string;
  defaultLanguage: LanguageCode;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameZh: string;
  description: string;
  unit: string;
  defaultUnitPrice: number;
  currency: string;
  hsCode: string;
  originCountry: string;
  netWeight: number;
  grossWeight: number;
  packageType: string;
  dimensions: string;
  image?: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  productId?: string;
  sku: string;
  name: string;
  nameZh: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  packageCount: number;
  netWeight: number;
  grossWeight: number;
  measurements: number;
  hsCode?: string;
  originCountry?: string;
  image?: string;
}

export interface ShippingParty {
  name: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  reference: string;
}

export interface ShipmentDetails {
  bookingNumber: string;
  masterBillNumber: string;
  houseBillNumber: string;
  carrierName: string;
  carrierScac: string;
  vesselName: string;
  voyageNumber: string;
  placeOfReceipt: string;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfDelivery: string;
  lastForeignPort: string;
  etd: string;
  eta: string;
  freightTerms: string;
  serviceContractNumber: string;
}

export interface ShippingParties {
  shipper: ShippingParty;
  consignee: ShippingParty;
  notifyParty: ShippingParty;
}

export type VgmMethod = "method1" | "method2";

export interface ShippingContainer {
  id: string;
  containerNumber: string;
  sealNumber: string;
  sizeType: string;
  packageCount: number;
  packageType: string;
  grossWeightKg: number;
  volumeCbm: number;
  vgmMethod?: VgmMethod;
  weighedGrossMassKg?: number;
  tareWeightKg?: number;
  cargoWeightKg?: number;
  packagingWeightKg?: number;
  dunnageWeightKg?: number;
}

export interface AmsDetails {
  shipmentType: string;
  inBondNumber: string;
  entryNumber: string;
  cargoControlNumber: string;
}

export interface IsfDetails {
  seller: ShippingParty;
  buyer: ShippingParty;
  manufacturer: ShippingParty;
  shipToParty: ShippingParty;
  stuffingLocation: ShippingParty;
  consolidator: ShippingParty;
  importerOfRecordNumber: string;
  consigneeNumber: string;
  htsusNumber: string;
  countryOfOrigin: string;
}

export interface VgmDetails {
  weighingDate: string;
  weighingLocation: string;
  weighingEquipmentId: string;
  weighingCertificateNumber: string;
  authorizedPerson: string;
  authorizedPersonTitle: string;
  signatureDate: string;
}

export interface SiDetails {
  releaseType: string;
  originalBillCount: number;
  freightPayableAt: string;
  alsoNotifyParty: ShippingParty;
  documentInstructions: string;
  specialInstructions: string;
}

export interface TradeDocument {
  id: string;
  type: DocumentType;
  number: string;
  title: string;
  issueDate: string;
  status: DocumentStatus;
  language: LanguageCode;
  themeId: string;
  currency: string;
  companySnapshot: Company;
  customerSnapshot: Customer | null;
  items: DocumentItem[];
  validUntil: string;
  paymentTerms: string;
  incoterm: string;
  origin: string;
  destination: string;
  shippingMarks: string;
  contractTerms: string;
  notes: string;
  showPrices: boolean;
  showImages: boolean;
  showStamp: boolean;
  showBankInfo: boolean;
  shipping?: ShipmentDetails;
  shippingParties?: ShippingParties;
  containers?: ShippingContainer[];
  ams?: AmsDetails;
  isf?: IsfDetails;
  vgm?: VgmDetails;
  si?: SiDetails;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentTemplate {
  type: DocumentType;
  name: string;
  language: LanguageCode;
  currency: string;
  themeId: string;
  paymentTerms: string;
  incoterm: string;
  origin: string;
  destination: string;
  shippingMarks: string;
  contractTerms: string;
  notes: string;
  showPrices: boolean;
  showImages: boolean;
  showStamp: boolean;
  showBankInfo: boolean;
  updatedAt: string;
}

export interface AppData {
  company: Company;
  customers: Customer[];
  products: Product[];
  documents: TradeDocument[];
  templates: DocumentTemplate[];
}

export type EditorSection =
  | "basic"
  | "parties"
  | "items"
  | "terms"
  | "shipping"
  | "declaration"
  | "containers"
  | "signature"
  | "layout";
export type AppView = "dashboard" | "documents" | "products" | "customers" | "templates" | "new" | "editor";
