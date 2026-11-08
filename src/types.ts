export type DocumentType = "quotation" | "proforma" | "commercial" | "packing" | "contract";
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
  image?: string;
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

export type EditorSection = "basic" | "parties" | "items" | "terms" | "layout";
export type AppView = "dashboard" | "documents" | "products" | "customers" | "templates" | "new" | "editor";
