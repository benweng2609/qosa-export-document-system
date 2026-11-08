import { getDocumentType } from "./data";
import type { Company, Customer, DocumentItem, DocumentTemplate, TradeDocument } from "./types";

const productImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="12" fill="#EFF6FF"/><path d="M38 18h20v12H38z" fill="#64748B"/><path d="M34 30h28l4 48H30z" fill="#94A3B8"/><path d="M36 36h24" stroke="#F8FAFC" stroke-width="3"/></svg>')}`;

const demonstrationStamp = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#C2410C" stroke-width="4" opacity=".72"/><circle cx="60" cy="60" r="39" fill="none" stroke="#C2410C" stroke-width="1.5" opacity=".72"/><text x="60" y="57" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#C2410C" opacity=".78">DEMO</text><text x="60" y="76" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#C2410C" opacity=".78">SAMPLE ONLY</text></svg>')}`;

const previewCustomer: Customer = {
  id: "template-preview-customer",
  name: "Sample Trading GmbH",
  contact: "Alex Morgan",
  country: "Germany",
  email: "buyer@example.com",
  phone: "+49 30 0000 0000",
  billingAddress: "Musterstrasse 18, 10115 Berlin, Germany",
  shippingAddress: "Musterstrasse 18, 10115 Berlin, Germany",
  registration: "SAMPLE CUSTOMER · NOT A REAL COMPANY",
  defaultLanguage: "en",
  updatedAt: "2026-11-08T00:00:00.000Z",
};

const previewItems: DocumentItem[] = [
  {
    id: "template-preview-item-1",
    sku: "DEMO-001",
    name: "Sample Stainless Steel Bottle",
    nameZh: "示例不锈钢保温杯",
    description: "500 ml · demonstration specification",
    quantity: 240,
    unit: "pcs",
    unitPrice: 4.85,
    packageCount: 10,
    netWeight: 76.8,
    grossWeight: 91.2,
    measurements: 0.64,
    image: productImage,
  },
  {
    id: "template-preview-item-2",
    sku: "DEMO-002",
    name: "Sample Ceramic Travel Mug",
    nameZh: "示例陶瓷随行杯",
    description: "350 ml · demonstration specification",
    quantity: 120,
    unit: "pcs",
    unitPrice: 3.6,
    packageCount: 5,
    netWeight: 36,
    grossWeight: 43.2,
    measurements: 0.315,
    image: productImage,
  },
];

export function createTemplatePreviewDocument(template: DocumentTemplate, company: Company): TradeDocument {
  const timestamp = "2026-11-08T00:00:00.000Z";
  return {
    id: `template-preview-${template.type}`,
    type: template.type,
    number: `${getDocumentType(template.type).prefix}-SAMPLE`,
    title: `${getDocumentType(template.type).name}模板预览`,
    issueDate: "2026-11-08",
    status: "draft",
    language: template.language,
    themeId: template.themeId,
    currency: template.currency,
    companySnapshot: { ...company, stamp: company.stamp ?? demonstrationStamp },
    customerSnapshot: { ...previewCustomer },
    items: previewItems.map((item) => ({ ...item })),
    validUntil: "2026-12-08",
    paymentTerms: template.paymentTerms,
    incoterm: template.incoterm,
    origin: template.origin,
    destination: template.destination,
    shippingMarks: template.shippingMarks || "SAMPLE MARKS\nMADE IN CHINA",
    contractTerms: template.contractTerms,
    notes: template.notes,
    showPrices: template.showPrices,
    showImages: template.showImages,
    showStamp: template.showStamp,
    showBankInfo: template.showBankInfo,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
